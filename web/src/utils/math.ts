/**
 * 随机9位数字码
 */
const generateNineDigitNumber: string = () => {
    return Math.floor(100_000_000 + Math.random() * 900_000_000).toString();
}

export { generateNineDigitNumber }
