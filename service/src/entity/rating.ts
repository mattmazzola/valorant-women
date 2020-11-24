import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"

@Entity()
export class Rating {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    createdAt: Date

    @Column()
    isWomen: boolean

    @Column()
    userName: string

    @Column("simple-array")
    rankedAgentNames: string[]
}