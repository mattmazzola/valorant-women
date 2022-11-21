export function shuffle<T>(xs: T[]): T[] {
    // Copy to prevent mutation of input
    const copy = [...xs]
    const shuffled: T[] = []

    while (copy.length > 0) {
        // get random index from existing set
        const randomIndex = Math.floor(Math.random() * copy.length)
        // get item and move to new list
        const [x] = copy.splice(randomIndex, 1)

        shuffled.push(x)
    }

    return shuffled
}

// TODO: Another function which transforms back into original object?
export function getFormData(data: object): Record<string, string> {
    const formData: Record<string, string> = {}

    Object.entries(data)
        .reduce((acc, [key, value]) => {
            if (Array.isArray(value)) {
                for (let [itemIndex, itemValue] of value.entries()) {
                    const itemKey = `${key}${itemIndex}`
                    acc[itemKey] = itemValue ?? ''
                }
            }
            else if (typeof value === 'object' || typeof value === 'boolean') {
                acc[key] = JSON.stringify(value) ?? ''
            } else {
                acc[key] = value ?? null
            } 

            return acc
        }, formData)

    return formData
}