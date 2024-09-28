type LocalStorage = {
    darkMode: boolean
}

//Function to get the local storage item
export const getLocalStorageItem = <T extends keyof LocalStorage>(key: T): LocalStorage[T] | null  => {
    if (key === null || key === undefined || localStorage.getItem(key) === null) {
        return null
    }
    return JSON.parse(localStorage.getItem(key) as string) as LocalStorage[T]
}

//Function to set the local storage item
export const setLocalStorageItem = <T extends keyof LocalStorage>(key: T, value: LocalStorage[T]): void => {
    if (value === null || value === undefined) {
        localStorage.removeItem(key)
    }
    localStorage.setItem(key, JSON.stringify(value))
}