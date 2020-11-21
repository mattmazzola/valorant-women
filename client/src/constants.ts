import { Agent } from './models'

// The 'id's of these must match the ids on the server since they are matched by string
export const agents: Agent[] = [
    {
        id: 'jett',
        name: 'Jett',
        imageUrl: '/images/Jett.png',
    },
    {
        id: 'killjoy',
        name: 'Killjoy',
        imageUrl: '/images/Killjoy.png',
    },
    {
        id: 'raze',
        name: 'Raze',
        imageUrl: '/images/Raze.png',
    },
    {
        id: 'reyna',
        name: 'Reyna',
        imageUrl: '/images/Reyna.png',
    },
    {
        id: 'sage',
        name: 'Sage',
        imageUrl: '/images/Sage.png',
    },
    {
        id: 'skye',
        name: 'Skye',
        imageUrl: '/images/Skye.png',
    },
    {
        id: 'viper',
        name: 'Viper',
        imageUrl: '/images/Viper.png',
    },
]


export const bannedWords: string[] = [
    'fuck',
    'damn',
    'shit',
    'bastard',
]