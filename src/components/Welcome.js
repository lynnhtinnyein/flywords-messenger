import { memo, useState } from "react";

const Welcome = ({ 
    createChannel, 
    joinChannel,
    setCurrentUser,
}) => {

    const [textInput, setTextInput] = useState('');
    const [showJoinChannelInput, setShowJoinChannelInput] = useState(false);
    const [joinChannelInput, setJoinChannelInput] = useState("");

    return (
        <div className="flex flex-1 justify-center items-center">

            <div className="flex flex-col justify-center items-center">
                <span className="font-bold text-3xl">FlyWords Messenger</span>

                <div className="w-full mt-10">
                    <span className="text-green-500 font-bold mx-1">UserName</span>
                    <input
                        type="text"
                        placeholder="Enter Username"
                        className="py-3 px-4 break-words text-xs rounded-full w-full border border-black mt-2"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                    />

                    <div className={`flex w-full overflow-hidden transition-all duration-200 ${
                        textInput === '' ? 'max-h-0' : 'max-h-20'
                    }`}>
                        <button
                            className="flex-1 rounded-full bg-green-300 p-3 mt-3 hover:bg-green-400 active:bg-green-500"
                            onClick={createChannel}
                        >
                            <span>Create</span>
                        </button>
                    </div>
                </div>
                

                <div className="w-full mt-5">
                    <ul className="mx-3 space-y-2">
                        <li className="text-gray-500 text-xs">
                            * Just to Display in Chat
                        </li>
                        <li className="text-gray-500 text-xs">
                            * You Don't Need To Login Or Register
                        </li>
                    </ul>
                </div>
                

            </div>

        </div>
    );
};

export default memo(Welcome);
