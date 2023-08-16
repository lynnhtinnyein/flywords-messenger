import { memo, useState } from "react";

const Welcome = ({ createChannel, joinChannel, setCurrentUser }) => {

    const [userName, setUserName] = useState("");
    const [joinChannelInput, setJoinChannelInput] = useState("");
    const [showJoinChannelInput, setShowJoinChannelInput] = useState(false);
    const [userNameCreated, setUserNameCreated] = useState(false);

    const createUser = () => {
        if(userName !== ''){
            setCurrentUser(userName)
            setUserNameCreated(true);
        }
    }

    return (
        <div
            class="flex flex-row overflow-hidden transition-all duration-500"
            style={{
                marginLeft: userNameCreated ? "-100%" : "0",
            }}
        >

            {/* username create screen */}
            <div class="flex flex-none items-center justify-center w-screen h-screen">
                <div className="flex flex-col justify-center items-center">
                    <span className="font-bold text-3xl">
                        FlyWords Messenger
                    </span>

                    <div className="w-full mt-10">
                        <span className="text-green-500 font-bold mx-1">
                            Describe Yourself
                        </span>

                        <div className="flex flex-row border border-black rounded-full mt-2">
                            <input
                                type="text"
                                placeholder="Enter Username"
                                className={`flex-1 px-4 py-3 text-xs w-full ${
                                    userName === ""
                                        ? "rounded-full"
                                        : "rounded-l-full"
                                }`}
                                value={userName}
                                onChange={(e) =>
                                    setUserName(e.target.value)
                                }
                            />

                            <button
                                className={`flex items-center justify-center rounded-full bg-green-300 transition-all duration-200 overflow-hidden ${
                                    userName === "" ? "w-0" : "w-16 m-1"
                                }`}
                                onClick={createUser}
                            >
                                <span className="text-xs">Create</span>
                            </button>
                        </div>

                        <ul className="mx-1 space-y-2 mt-5">
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

            {/* create/join channel screen */}
            <div class="flex flex-none items-center justify-center w-screen h-screen">
                <div className="flex flex-col justify-center items-center pb-5">

                    <div className="w-full">
                        <button 
                            className="flex flex-row justify-center items-center border border-black rounded px-3 py-2 space-x-1 hover:bg-gray-300 active:bg-gray-400"
                            onClick={ () => setUserNameCreated(false)}
                        >
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                            <span className="text-xs">Back</span>
                        </button>
                    </div>

                    <span className="font-bold text-3xl mt-10">
                        FlyWords Messenger
                    </span>

                    <div className="w-full mt-10">
                        <button
                            className="flex flex-row space-x-2 items-center justify-center rounded-full w-full py-3 bg-green-300 hover:bg-green-400 active:bg-green-500"
                            onClick={createChannel}
                        >
                            <i className="fa-solid fa-plus"></i>
                            <span>Create A New Room</span>
                        </button>

                        <button
                            className="flex flex-row space-x-2 items-center justify-center rounded-full w-full py-3 bg-blue-200 hover:bg-blue-300 active:bg-blue-400 mt-3"
                            onClick={() =>
                                setShowJoinChannelInput(
                                    !showJoinChannelInput
                                )
                            }
                        >
                            <i className="fa-solid fa-link"></i>
                            <span>Join Chat Room</span>
                        </button>

                        <div className={`flex flex-row border border-black rounded-full mt-3 transition-opacity duration-200 ${
                            showJoinChannelInput ? 'opactiy-100' : 'opacity-0'
                        }`}>
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                className="flex-1 px-4 py-3 text-xs w-full rounded-l-full"
                                value={joinChannelInput}
                                onChange={(e) =>
                                    setJoinChannelInput(e.target.value)
                                }
                            />

                            <button
                                className="flex items-center justify-center rounded-full bg-green-300 w-16 m-1 "
                                onClick={ () => joinChannel(joinChannelInput)}
                            >
                                <span className="text-xs">Join</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Welcome);
