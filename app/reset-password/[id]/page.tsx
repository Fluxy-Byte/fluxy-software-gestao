import Reset from "@/app/reset-password/[id]/reset"

export default async function Page({ params, }: { params: { id: string } }) {
    const { id } = await params;
    console.log(id)
    return <Reset token={id} />
}