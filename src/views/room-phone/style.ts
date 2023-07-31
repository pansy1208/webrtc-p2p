import styled from "styled-components";

export const RoomPhoneWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(34, 32, 31, 0.84);

  .header {
    position: absolute;
    width: 100%;
    height: 55px;
    z-index: 9;
    display: flex;
    align-items: center;
    padding-left: 15px;
    //background: rgba(0,0,0,.1);

    img {
      height: 40px;
    }
  }

  video {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    object-fit: cover;
  }

  .video-box {
    position: relative;
    background: rgba(204, 204, 204, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;

    .info {
      width: 20%;
      text-align: center;

      img {
        width: 100%;
        object-fit: cover;
        border-radius: 10%;
      }

      > div {
        color: #fff;
        font-size: 16px;
        margin-top: 5px;
      }
    }

    .mute-box {
      position: absolute;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: #fff;
      right: 10px;
      bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 25px;
      }
    }

    .default {
      width: 20%;
    }

    .avatar {
      width: 100%;
      height: 100%;
    }

    .moreCallInfo {
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 0;
      }
    }
  }

  .video-area {
    height: calc(100% - 70px);;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    align-content: center;
  }

  .zoom-area {
    position: relative;
    height: calc(100% - 70px);;
    width: 100%;

    > div {
      position: absolute;
    }
  }

  .p2p {
    height: 100%;

    .shrink-video {
      width: 30%;
      height: 30%;
      position: absolute;
      top: 25px;
      right: 10px;
      z-index: 9;
      border: 1px solid #fff;
      background: rgb(34, 32, 31);

      video {
        object-fit: contain;
        background: rgba(0, 0, 0, 0.1);
      }
    }

    .large-video {
      width: 100%;
      height: 100%;
    }

    video {
      object-fit: contain;
    }
  }

  .toolbar {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 220px;
    color: #fff;
    z-index: 99;

    .top {
      display: flex;
      justify-content: space-evenly;

      > div {
        display: flex;
        flex-direction: column;
        align-items: center;

        > div {
          width: 55px;
          height: 55px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 28px;
          }
        }

        span {
          margin-top: 10px;
        }
      }

      .exit {
        background: #ed6a65;
      }

      .hangup {
        img {
          width: 35px;
          margin-top: -3px;
        }
      }
    }

    .bottom {
      display: flex;
      justify-content: space-evenly;
      margin-top: 20px;
      align-items: center;

      > div {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 55px;
        height: 55px;
      }

      .hangup {
        background: red;
        border-radius: 50%;
      }

      .exit {
        width: 35px;
        border-radius: 50%;
        margin-top: -3px;
      }

      .change {
        width: 35px;
        height: 35px;
      }

    }
  }

  .toolbar2 {
    height: 70px;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 280px;
    display: flex;
    color: #fff;
    align-items: center;
    justify-content: space-around;

    > div {
      display: flex;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      align-items: center;
      justify-content: center;

      img {
        width: 30px;
      }
    }

    .speaker {
      img {
        width: 28px;
      }
    }

    .exit {
      background: red;

      img {
        margin-top: -3px;
      }
    }
  }

  .audioStyle {
    justify-content: center;

    div:nth-child(2) {
      margin: 0 15px;
    }
  }

  .tips {
    position: absolute;
    top: 30px;
    width: 250px;
    height: 35px;
    border-radius: 5px;
    text-align: center;
    line-height: 35px;
    color: #fff;
    background: rgba(0, 0, 0, 0.3);
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
  }

  .mask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .exit-tips {
    width: 150px;
    height: 30px;
    color: #fff;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    line-height: 30px;
    text-align: center;
  }
`