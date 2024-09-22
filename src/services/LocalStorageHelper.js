//Function to get the local storage item
export const getLocalStorageItem = (key) => {
    if (localStorage.getItem(key) === null) {
        return null
    }
    return JSON.parse(localStorage.getItem(key))
}

//Function to set the local storage item
export const setLocalStorageItem = (key, value) => {
    if (value === null || value === undefined) {
        localStorage.removeItem(key)
    }
    localStorage.setItem(key, JSON.stringify(key))

}