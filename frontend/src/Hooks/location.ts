import { useLocation } from 'react-router'

export const useLocationSearchParams = () =>
    new URLSearchParams(useLocation().search)
