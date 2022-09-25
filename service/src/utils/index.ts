export async function delay(ms: number) {
    return new Promise((res, rej) => {
        setTimeout(() => { res(undefined) }, ms)
    })
}
