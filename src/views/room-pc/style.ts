import styled from "styled-components";

export const RoomPCWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #292929;
  position: relative;

  .container {
    height: calc(100% - 120px);
  }

  video {
    width: 100%;
    height: 100%;
  }

  .info {
    position: absolute;
    width: 100%;
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
    background: rgba(0, 0, 0, 0.2);
    color: #fff;
    bottom: 0;

    > span {
      display: flex;
      align-items: center;

      img {
        width: 22px;
        margin-right: 5px;
      }
    }
  }

  .video-area {
    width: 100%;
    height: calc(100% - 120px);
    position: absolute;
    top: 0;

    .video-box {
      position: absolute;
      background: rgba(204, 204, 204, .2);

      .bg {
        width: 100%;
        height: 100%;
        object-fit: none;
      }
    }
  }

  .zoom-area {
    position: relative;
    overflow: auto;

    .video-box {
      position: absolute;
      background: rgba(204, 204, 204, .2);

      .bg {
        width: 100%;
        height: 100%;
        object-fit: none;
      }

    }

    .bigVideo {
      .bg {
        width: 10%;
        height: unset;
        border-radius: 8%;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        object-fit: none;
      }
    }
  }

  .footer {
    height: 120px;
    display: flex;
    color: #fff;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    width: 100%;

    > div {
      width: 90px;
      height: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 13px;
      justify-content: space-evenly;
      cursor: pointer;

      > div {
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      img {
        height: 24px;
      }
    }

    .exit {

      > div {
        width: 48px;
        height: 48px;
        background: #f75352;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 32px;
        }
      }
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

  .play-tips {
    width: 400px;
    height: 200px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -60%);
    background: #fff;
    font-size: 14px;

    .title {
      height: 55px;
      line-height: 55px;
      text-align: center;
      font-size: 16px;
      font-weight: 400;
      border-bottom: 1px solid #f2f2f2;
    }

    .content {
      height: calc(100% - 125px);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 60px;
        height: 60px;
        margin: 0 10px 0 -40px;
      }

      span {
        width: 200px;
        font-weight: 400;
      }
    }

    .tip-footer {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 20px;

      button {
        background: #00abfd;
        width: 120px;
        height: 35px;
        border: 0;
        color: #fff;
      }
    }
  }
`