export const decodeBase64 = (binaryString: string) => {
    return Buffer.from(binaryString, 'base64').toString('utf8');
};
