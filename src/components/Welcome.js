import { memo, useState } from "react";

const Welcome = ({ createChannel, joinChannel}) => {

    const [showJoinChannelInput, setShowJoinChannelInput] = useState(false);
    const [joinChannelInput, setJoinChannelInput] = useState('');

    return (
        <div className="flex flex-1 justify-center items-center">

            <div className="flex flex-col justify-center items-center">

                <span className="font-bold text-3xl">FlyWords Messenger</span>

                <button 
                    className="flex flex-row items-center justify-center w-full space-x-2 rounded-full bg-green-300 p-3 mt-10 hover:bg-green-400 active:bg-green-500"
                    onClick={createChannel}
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Create A Chat Room</span>
                </button>

                <button 
                    className="flex flex-row items-center justify-center w-full space-x-2 rounded-full bg-blue-200 p-3 mt-5 hover:bg-blue-300 active:bg-blue-400"
                    onClick={ () => setShowJoinChannelInput(!showJoinChannelInput)}
                >
                    <i className="fa-solid fa-link"></i>
                    <span>Join Chat Room</span>
                </button>

                <div className={`flex flex-row rounded-full border border-black mt-5 w-full transition-opacity duration-300 ${showJoinChannelInput ? 'opacity-100' : 'opacity-0'}`}>
                    <input 
                        type="text" 
                        placeholder="Enter Room ID"
                        className="py-2 px-3 rounded-l-full"
                        value={joinChannelInput}
                        onChange={ e => setJoinChannelInput(e.target.value)}
                    />
                    <button 
                        className="flex-1 py-1 px-4 rounded-full m-1 bg-green-300 hover:bg-green-400 active:bg-green-500"
                        onClick={ () => joinChannel(joinChannelInput)}
                    >
                        Join
                    </button>
                </div>

            </div>

        </div>
    );
}
 
export default memo(Welcome);