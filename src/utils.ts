export const isArray = (obj: unknown) => {
  return (
    Array.isArray(obj) ||
    (typeof obj === "object" &&
      Object.prototype.toString.call(obj) === "[object Array]")
  );
};

/**
 * 生成指定长度的随机串
 * @param {Object} len
 */
export const randomString = (len: number) => {
  const l = len || 32;
  const $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const maxPos = $chars.length;
  let pwd = "";
  for (let i = 0; i < l; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

export const dateFormat = (dt: Date, fmt: string) => {
    const o:Record<string, number> = {
        "M+": dt.getMonth() + 1, //月份
        "d+": dt.getDate(), //日
        "h+": dt.getHours(), //小时
        "m+": dt.getMinutes(), //分
        "s+": dt.getSeconds(), //秒
        "q+": Math.floor((dt.getMonth() + 3) / 3), //季度
        S: dt.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)){
        const regx = new RegExp(/(y+)/);
        const value = regx.exec(fmt);
        let len = 0;
        if(value && value.length > 0){
            len = value[0].length;
        }
        fmt = fmt.replace(/(y+)/, dt.getFullYear() + "").substring(4 - len);
    }

    for (const k in o){
        const s:string = "(" + k + ")";
        const regx = new RegExp(s);
        if(regx.test(fmt)){
            const value = regx.exec(fmt);
            let len = 0;
            if(value && value.length > 0){
                len = value[0].length;
            }
            fmt = fmt.replace(regx, len == 1 ? o[k].toString() : ("00" + o[k]).substring(o[k].toString().length))
        }
    }
    return fmt;
}