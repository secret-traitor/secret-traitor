import { backendHttpUrl } from 'src/env'

module.exports = {
    client: {
        service: {
            name: 'backend',
            url: backendHttpUrl,
            skipSSLValidation: true,
        },
    },
}
