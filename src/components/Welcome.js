import { memo, useRef, useState } from "react";
import generateUniqueName from "../helper/generateUniqueName";

const Welcome = ({ createChannel, joinChannel, setCurrentUser }) => {

    const joinChannelInputRef = useRef(null);
    const [userName, setUserName] = useState("");
    const [joinChannelInput, setJoinChannelInput] = useState("");
    const [showJoinChannelInput, setShowJoinChannelInput] = useState(false);
    const [userCreated, setUserCreated] = useState(false);

    const createUser = () => {
        if(userName !== ''){
            const id = 'user_' + generateUniqueName();
            const name = userName;
            setCurrentUser({id, name})
            setUserCreated(true);
        }
    }

    const handleKeyPress = (event, type) => {
        if (event.key === "Enter") {
            if(type === 'create'){
                createUser();
            } else {
                joinChannel(joinChannelInput);
            }
        }
    }

    return (
        <div
            className="flex flex-row overflow-hidden transition-all duration-500"
            style={{
                marginLeft: userCreated ? "-100%" : "0",
            }}
        >

            {/* username create screen */}
            <div className="flex flex-none items-center justify-center w-screen h-screen dark:bg-zinc-700">
                <div className="flex flex-col justify-center items-center">
                    <span className="font-bold text-3xl dark:text-white">
                        FlyWords Messenger
                    </span>

                    <div className="w-full mt-10">
                        <span className="text-green-500 font-bold mx-1">
                            Describe Yourself
                        </span>

                        <div className="flex flex-row border border-black rounded-full mt-2 dark:bg-zinc-600 dark:border-zinc-600">
                            <input
                                type="text"
                                placeholder="Enter Username"
                                className={`flex-1 px-4 py-3 text-xs w-full dark:bg-zinc-600 dark:text-white ${
                                    userName === ""
                                        ? "rounded-full"
                                        : "rounded-l-full"
                                }`}
                                value={userName}
                                onChange={(e) =>
                                    setUserName(e.target.value)
                                }
                                onKeyUp={ (event) => handleKeyPress(event, 'create')}
                            />

                            <button
                                className={`flex items-center justify-center rounded-full bg-green-300 hover:bg-green-400 active:bg-green-500 transition-all duration-200 overflow-hidden ${
                                    userName === "" ? "w-0" : "w-16 m-1"
                                }`}
                                onClick={createUser}
                            >
                                <span className="text-xs">Create</span>
                            </button>
                        </div>

                        <ul className="mx-1 space-y-2 mt-5">
                            <li className="text-gray-500 text-xs dark:text-gray-300">
                                * Just to Display in Chat
                            </li>
                            <li className="text-gray-500 text-xs dark:text-gray-300">
                                * You Don't Need To Login Or Register
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* create/join channel screen */}
            <div className="flex flex-none items-center justify-center w-screen h-screen dark:bg-zinc-700">
                <div className="flex flex-col justify-center items-center pb-5">

                    <div className="w-full">
                        <button 
                            className="flex flex-row justify-center items-center border border-black rounded px-3 py-2 space-x-1 dark:border-gray-400"
                            onClick={ () => setUserCreated(false)}
                        >
                            <i className="fa-solid fa-chevron-left text-xs dark:text-gray-300"></i>
                            <span className="text-xs dark:text-gray-300">Back</span>
                        </button>
                    </div>

                    <span className="font-bold text-3xl mt-10 dark:text-white">
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
                            onClick={() => {
                                joinChannelInputRef.current.focus();
                                setShowJoinChannelInput(
                                    !showJoinChannelInput
                                )
                            }}
                        >
                            <i className="fa-solid fa-link"></i>
                            <span>Join Chat Room</span>
                        </button>

                        <div className={`flex flex-row border border-black rounded-full mt-3 transition-opacity duration-200 dark:bg-zinc-600 dark:border-zinc-800 ${
                            showJoinChannelInput ? 'opactiy-100' : 'opacity-0'
                        }`}>
                            <input
                                ref={joinChannelInputRef}
                                type="text"
                                placeholder="Enter Room ID"
                                className="flex-1 px-4 py-3 text-xs w-full rounded-l-full dark:bg-zinc-600 dark:text-white"
                                value={joinChannelInput}
                                onChange={(e) =>
                                    setJoinChannelInput(e.target.value)
                                }
                                onKeyUp={ (event) => handleKeyPress(event, 'join')}
                            />

                            <button
                                className="flex items-center justify-center rounded-full w-16 m-1 bg-green-300 hover:bg-green-400 active:bg-green-500"
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
