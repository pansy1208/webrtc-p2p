import {memo, useEffect, useRef, useState} from "react";
import type {FC} from "react"
import {HomeWrapper} from "@/views/home/style";
import {useNavigate} from "react-router-dom";
import storage from "@/utils/Storage";
import {Button, Card, Form, Input, Checkbox, Radio} from "antd";
import type {FormInstance, RadioChangeEvent} from "antd"
import type {CheckboxChangeEvent} from 'antd/es/checkbox';
import utils from "@/utils/Utils";

interface ITurnInfo {
    turnServer: string
    turnAccount: string
    turnPassword: string
    iceTransportPolicy: "all" | "relay"
}

interface IRoomInfo {
    roomId: string,
    username: string,
    turnServer?: string,
    turnAccount?: string,
    turnPassword?: string
}

const Home: FC = () => {
    const navigate = useNavigate()

    const [isMore, setIsMore] = useState(true)
    const [roomType, setRoomType] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isTurn, setIsTurn] = useState(false)
    const [iceTransportPolicy, setIceTransportPolicy] = useState<"all" | "relay">("all")
    const form = useRef<FormInstance>(null)

    useEffect(() => {
        const turnInfo = storage.getItem("turnInfo", true)
        if (turnInfo) {
            setIsTurn(true)
            setIceTransportPolicy(turnInfo.iceTransportPolicy)
            form.current!.setFieldsValue({
                turnServer: turnInfo.turnServer,
                turnAccount: turnInfo.turnAccount,
                turnPassword: turnInfo.turnPassword,
                iceTransportPolicy: turnInfo.iceTransportPolicy
            })
        }
    }, [])

    const onMoreChange = (e: CheckboxChangeEvent) => {
        setIsMore(e.target.checked)
    }

    const onRoomTypeChange = (e: RadioChangeEvent) => {
        setRoomType(e.target.value)
    }

    const onCameraChange = (e: CheckboxChangeEvent) => {
        setIsOpen(e.target.checked)
    }

    const onTurnChange = (e: CheckboxChangeEvent) => {
        setIsTurn(e.target.checked)
    }

    const onIceChange = (e: RadioChangeEvent) => {
        setIceTransportPolicy(e.target.value)
    }

    const enterRoom = (data: IRoomInfo) => {
        if (isTurn) {
            const turnInfo: ITurnInfo = {
                turnServer: data.turnServer!,
                turnAccount: data.turnAccount!,
                turnPassword: data.turnPassword!,
                iceTransportPolicy: iceTransportPolicy
            }
            storage.setItem("turnInfo", turnInfo, true)
        } else {
            storage.removeItem("turnInfo", true)
        }
        storage.setItem("roomInfo", {
            roomType,
            openCamera: isOpen,
            manyPeople: isMore,
            roomId: data.roomId,
            username: data.username
        })

        if (!utils.isPhone()) {
            navigate('/room-phone')
        } else {
            navigate('/room-pc')
        }

    }

    return <HomeWrapper>
        <div className={"content"}>
            <Card>
                <Form
                    ref={form}
                    style={{maxWidth: 600}}
                    onFinish={enterRoom}
                    autoComplete="off"
                >
                    <Form.Item
                        name="roomId"
                        rules={[{required: true, message: '房间ID不能为空'}]}
                    >
                        <Input placeholder={"请输入房间ID"}/>
                    </Form.Item>
                    <Form.Item
                        name="username"
                        rules={[{required: true, message: '昵称不能为空'}]}
                    >
                        <Input placeholder={"请输入昵称"}/>
                    </Form.Item>
                    <Form.Item initialValue={0} name="roomType">
                        <Radio.Group onChange={onRoomTypeChange} value={roomType}>
                            <Radio value={0}>语音房间</Radio>
                            <Radio value={1}>视频房间</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {
                        roomType === 1 ? <Form.Item>
                            <Checkbox checked={isOpen} onChange={onCameraChange}>打开摄像头</Checkbox>
                        </Form.Item> : null
                    }
                    <Form.Item>
                        <Checkbox checked={isMore} onChange={onMoreChange}>多人</Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Checkbox checked={isTurn} onChange={onTurnChange}>Turn服务</Checkbox>
                    </Form.Item>
                    {
                        isTurn ? <>
                            <Form.Item
                                name="turnServer"
                                rules={[{required: true, message: 'Turn服务地址不能为空'}]}
                            >
                                <Input placeholder={"请输入Turn服务地址"}/>
                            </Form.Item>
                            <Form.Item
                                name="turnAccount"
                                rules={[{required: true, message: 'Turn服务账号'}]}
                            >
                                <Input placeholder={"请输入Turn服务账号"}/>
                            </Form.Item>
                            <Form.Item
                                name="turnPassword"
                                rules={[{required: true, message: 'Turn服务密码不能为空'}]}
                            >
                                <Input placeholder={"请输入Turn服务密码"}/>
                            </Form.Item>
                            <Form.Item>
                                <Radio.Group onChange={onIceChange} value={iceTransportPolicy}>
                                    <Radio value={"all"}>All</Radio>
                                    <Radio value={"relay"}>Relay</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </> : null
                    }
                    <Form.Item>
                        <Button htmlType={"submit"} style={{width: "100%"}} type={"primary"}>确认</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    </HomeWrapper>
}

export default memo(Home)