import { ThemeType } from 'grommet/themes'

// https://coolors.co/d8dbe2-a9bcd0-228be6-373f51-1b1b1e
// https://paletton.com/#uid=31U110kllllaFw0g0qFqFg0w0aF

const theme: ThemeType = {
    global: {
        colors: {
            'brand-1': '#D8DBE2',
            'brand-2': '#A9BCD0',
            'brand-3': '#228BE6',
            'brand-4': '#373F51',
            'brand-5': '#1B1B1E',
            'ally-1': '#7689A9',
            'ally-2': '#2D4671',
            'enemy-1': '#D4796A',
            'enemy-2': '#802415',
        },

        font: {
            family: 'Roboto',
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
