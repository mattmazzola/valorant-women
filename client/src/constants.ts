import { Agent } from './models'

// The 'id's of these must match the ids on the server since they are matched by string
export const femaleAgents: Agent[] = [
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

export const maleAgents: Agent[] = [
    {
        id: 'breach',
        name: 'Breach',
        imageUrl: '/images/Breach.png',
    },
    {
        id: 'brimstone',
        name: 'Brimstone',
        imageUrl: '/images/Brimstone.png',
    },
    {
        id: 'cypher',
        name: 'Cypher',
        imageUrl: '/images/Cypher.png',
    },
    {
        id: 'omen',
        name: 'Omen',
        imageUrl: '/images/Omen.png',
    },
    {
        id: 'phoenix',
        name: 'Phoenix',
        imageUrl: '/images/Phoenix.png',
    },
    {
        id: 'sova',
        name: 'Sova',
        imageUrl: '/images/Sova.png',
    },
]

// How to have regex that matches when word is NOT in
// TODO: How to not have these in repo? Perhaps there is a service
export const bannedWords: string[] = [
    'fuck',
    'damn',
    'shit',
    'bastard',
    'ass',
]