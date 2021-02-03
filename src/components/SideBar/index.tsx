import React, { ButtonHTMLAttributes } from 'react';

import { Container } from './styles';

interface IProject {
  col:  {
    titles: string[];
  }
}

const Project: React.FC<IProject> = ({ col: { titles }}) => {
  return (
    <Container>

    </Container>

  );
}
 

export default Project;