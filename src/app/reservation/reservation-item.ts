export interface ReservationDetails {
    table_id: number,
    email: string,
    fullName: string,
    phone: string,
    date: string,
    time: string,
    people: number
}
export interface ReservationTable {
    table_id: number,
    date: string,
    time: string,
    people: number
}