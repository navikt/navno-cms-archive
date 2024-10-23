import { Content } from 'shared/types';
import style from './JsonView.module.css';

export const JsonView = (data: any) => {
    return <div className={style.view}>{data ? jsonPrettyPrint(data) : 'Ingen JSON'}</div>;
};

const jsonPrettyPrint = (data: any) => JSON.stringify(data, null, 2);
