import styled from 'styled-components';

export const Container = styled.div``;

export const Header = styled.header`
  padding: 32px 0;
  background: #28262e;
`;

export const HeaderContent = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;

  > img {
    height: 80px;
  }

  button {
    margin-left: auto;
    background: transparent;
    border: 0;

    svg {
      color: #999591;
      width: 20px;
      height: 20px;
    }
  }
`;

export const Profile = styled.div`
  display: flex;
  align-items: center;
  margin-left: 80px;

  img {
    width: 56px;
    height: 56px;
    border-radius: 50%;
  }

  div {
    display: flex;
    flex-direction: column;
    margin-left: 16px;
    line-height: 24px;

    span {
      color: #f4ede8;
    }

    a {
      text-decoration: none;
      color: #ff9000;

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;

export const Content = styled.main`
  max-width: 1120px;
  margin: 64px auto;
  display: flex;
`;


export const Section = styled.section`
  margin-top: 48px;

  > strong {
    color: #999591;
    font-size: 20px;
    line-height: 26px;
    border-bottom: 1px solid #3e3b47;
    display: block;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  > p {
    color: #999591;
  }
`;

export const Boards = styled.div`
  display: flex;
  margin-top: 32px;
`
export const Board = styled.div`
  background: #141316;
  border: 1px solid #FD951F11;
  border-radius: 4px;

  min-width: 182px;
  max-width: 282px;
  min-height: 100px;

  margin: 0 16px;

  > h3 {
    padding: 16px;
    margin: 0;
    color: #FD951Fcc;
  }
`;


export const Card = styled.div`
  background-color: #1A1A1C;
  padding: 16px;
  box-shadow: 0 2px 2px -1px #FD951Fcc;
  width: 250px;
  margin: 25px 0;
  border-radius: 4px;
  font-weight: 600;
  font-size: 18px;

  > status {
    width: 30px;
    height: 8px;
    background: gray;
    margin-bottom: 16px;
    border-radius: 8px;
  }

  > status.green {
    background: #23d2ac;
  }

  > status.blue {
    background: #33adff;
  }

  > status.red {
    background: red;
  }
`
export const Dropzone = styled.div`
  padding: 16px;
  min-width: 282px;
  min-height: 200px;
`;
