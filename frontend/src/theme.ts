import { ThemeType } from 'grommet/themes'

// https://coolors.co/d8dbe2-a9bcd0-228be6-373f51-1b1b1e
// https://paletton.com/#uid=31U110kllllaFw0g0qFqFg0w0aF

const theme: ThemeType = {
    global: {
        colors: {
            'blue-1': '#71B1EA',
            'blue-2': '#228BE6',
            'blue-3': '#1F7ED1',
            'blue-4': '#2D659C',

            // 'brand-1': '#264653',
            // 'brand-2': '#2A9D8F',
            // 'brand-3': '#E9C46A',
            // 'brand-4': '#F4A261',
            // 'brand-5': '#E76F51',

            'brand-1': 'rgb(127, 94, 75)',
            'brand-2': 'rgb(73, 72, 41)',
            'brand-3': 'rgb(64, 73, 42)',
            'brand-4': 'rgb(254, 253, 244)',
            'brand-5': 'rgb(86, 86, 86)',
            'brand-6': 'rgb(26, 26, 26)',
            'brand-7': 'rgb(155, 47, 37)',
            'brand-8': 'rgb(24, 48, 65)',
            'brand-9': 'rgb(245, 171, 48)',

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
    button: {
        disabled: {
            border: {
                color: 'red',
            },
        },
    },
}

export default theme
