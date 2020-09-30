import { ThemeType } from 'grommet/themes'

// https://coolors.co/d8dbe2-a9bcd0-228be6-373f51-1b1b1e

const theme: ThemeType = {
    global: {
        colors: {
            'brand-1': '#D8DBE2',
            'brand-2': '#A9BCD0',
            'brand-3': '#228BE6',
            'brand-4': '#373F51',
            'brand-5': '#1B1B1E',
        },
        font: {
            family: 'Roboto',
            size: '16px',
            height: '20px',
        },
        focus: {
            border: {
                color: 'none',
            },
        },
        input: {
            font: {
                weight: 'normal',
            },
        },
    },
    layer: {
        background: 'none',
    },
}

export default theme
