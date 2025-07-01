import UserData from './aviuserData.jsx';

export default function Header() {
    console.log("Header compnonent loading...")
    return (
        <div className="bg-red-500 text-white p-4">
            <h1 className ="text-[80px]">Beauty syndrome</h1>
            <p>qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq</p>
            <UserData></UserData>
        </div>
    )
}