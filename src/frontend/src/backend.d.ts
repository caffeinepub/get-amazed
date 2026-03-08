import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Fact {
    id: bigint;
    text: string;
    category: Category;
}
export enum Category {
    History = "History",
    Nature = "Nature",
    MindBlowing = "MindBlowing",
    Science = "Science"
}
export interface backendInterface {
    addFact(text: string, category: Category): Promise<Fact>;
    getAllCategories(): Promise<Array<Category>>;
    getAllFacts(category: Category | null): Promise<Array<Fact>>;
    getFact(id: bigint): Promise<Fact>;
    getRandomFact(category: Category | null): Promise<Fact>;
    initialize(): Promise<void>;
}
