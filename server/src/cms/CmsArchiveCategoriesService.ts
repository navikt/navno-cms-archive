import { CmsArchiveOpenSearchClient, SearchResult } from '../opensearch/CmsArchiveOpenSearchClient';
import { CmsArchiveSiteConfig } from './CmsArchiveSite';
import { CmsCategoryPath } from '../../../common/cms-documents/_common';
import { CmsCategoryListItem } from '../../../common/cms-documents/category';
import { CmsCategoryDocument } from '../opensearch/types';

type ConstructorProps = {
    config: CmsArchiveSiteConfig;
    client: CmsArchiveOpenSearchClient;
};

export class CmsArchiveCategoriesService {
    private readonly client: CmsArchiveOpenSearchClient;
    private readonly config: CmsArchiveSiteConfig;

    private readonly categoriesIndex: string;

    private readonly categoriesMap: Map<string, CmsCategoryListItem> = new Map();
    private readonly rootCategories: CmsCategoryListItem[] = [];

    constructor({ client, config }: ConstructorProps) {
        this.client = client;
        this.config = config;
        this.categoriesIndex = `${config.indexPrefix}_categories`;
    }

    public async init() {
        const allCategories = await this.getAllCategories();
        if (!allCategories) {
            console.error(`Could not retrieve categories for ${this.config.name}`);
            return false;
        }

        console.log(`Found ${allCategories.length} categories for ${this.config.name}`);

        this.populateCategoriesMap(allCategories);

        console.log(
            `Initialized categories service for ${this.config.name} with ${this.categoriesMap.size} categories and ${this.rootCategories.length} root categories`
        );
    }

    public getRootCategories(): CmsCategoryListItem[] {
        return this.rootCategories;
    }

    public getCategory(categoryKey: string): CmsCategoryListItem | undefined {
        return this.categoriesMap.get(categoryKey);
    }

    public async getCategoryFull(categoryKey: string): Promise<CmsCategoryDocument | null> {
        return this.client.getDocument<CmsCategoryDocument>({
            index: this.categoriesIndex,
            id: categoryKey,
        });
    }

    public getCategories(categoryKeys: string[]): CmsCategoryListItem[] {
        return categoryKeys.reduce<CmsCategoryListItem[]>((acc, key) => {
            const category = this.categoriesMap.get(key);
            if (category) {
                acc.push(category);
            }

            return acc;
        }, []);
    }

    private populateCategoriesMap(categories: CmsCategoryListItem[]) {
        this.categoriesMap.clear();
        this.rootCategories.length = 0;

        categories.forEach((category) => {
            this.categoriesMap.set(category.key, category);
            if (!category.superKey) {
                this.rootCategories.push(category);
            }
        });

        this.categoriesMap.forEach((category) => {
            if (category.superKey) {
                category.path = this.resolveCategoryPath(category.superKey);
            }
            category.categories.sort((a, b) => a.name.localeCompare(b.name));
        });

        this.rootCategories.sort((a, b) => a.title.localeCompare(b.title));
    }

    public resolveCategoryPath(categoryKey: string, path: CmsCategoryPath = []): CmsCategoryPath {
        const category = this.categoriesMap.get(categoryKey);
        if (!category) {
            console.error(`No category found for key ${categoryKey}`);
            return path;
        }

        const { key, superKey, title } = category;

        path.unshift({
            key,
            name: title,
        });

        if (!superKey) {
            return path;
        }

        return this.resolveCategoryPath(superKey, path);
    }

    private async getAllCategories(): Promise<CmsCategoryListItem[] | null> {
        return this.client
            .search<CmsCategoryDocument>({
                index: this.categoriesIndex,
                _source_excludes: ['xmlAsString'],
                size: 10000,
                body: {
                    query: {
                        match_all: {},
                    },
                },
            })
            .then((result) => {
                if (result && result.total > 10000) {
                    console.error(
                        `Found more than 10000 categories in ${this.categoriesIndex} - expected 3127 (sbs) or 3866 (fss)`
                    );
                }

                return this.transformResult(result);
            });
    }

    private transformResult(
        result: SearchResult<CmsCategoryDocument> | null
    ): CmsCategoryListItem[] | null {
        if (!result) {
            return null;
        }

        return result.hits.map((hit) => this.transformToListItem(hit));
    }

    private transformToListItem(document: CmsCategoryDocument): CmsCategoryListItem {
        const { key, title, categories, contents, superKey } = document;

        return {
            key,
            superKey,
            title,
            categories,
            contentCount: contents.length,
            path: [],
        };
    }
}
