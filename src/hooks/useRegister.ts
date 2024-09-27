import {useEffect} from "react";

const cacheRegister: Record<string, () => void> = {}

export const appendToRegister = (identifier: string, callback: () => void): void => {
    cacheRegister[identifier] = callback
}

export const useRegister = (): void => {
    useEffect(() => {

        return (): void => {
            Object.entries(cacheRegister).forEach(([key, call]) => {
                call()
                delete cacheRegister[key]
            })
        }
    }, [])
}