import style from './JsonView.module.css';

export const JsonView = (data: any) => {
    return <div className={style.view}>{jsonPrettyPrint(data)}</div>;
};

const jsonPrettyPrint = (data: any) => JSON.stringify(data, null, 2);
