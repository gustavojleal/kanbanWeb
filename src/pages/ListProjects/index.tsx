import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../../services/api'
import { useAuth } from '../../hooks/auth';
import logoImg from '../../assets/logo.svg';
import Button from '../../components/Button';

import Modal, {ModalBody, ModalFooter, ModalHeader, useModal} from '../../components/Window/modal'

import {
  Container,
  Header,
  Profile,
  HeaderContent,
  Menu,

  Board,
  Boards,
  Dropzone,
  Card,
  ModalCard,
} from './styles';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

interface ICard {
  id: string;
  column: number;
  taskName: string;
  description: string;
  status: string;
}

interface IStructure {
  columns: {
    column: number;
    name: string;
  }[]
  tasks: {
    id: string;
    column: number;
    taskName: string;
    description: string;
    status: string;
  }[]
}

interface IProjects {
  columns: { column: number; name: string; }[];
  tasks: { id: string; column: number; taskName: string; description: string; status: string; }[];
  id: string; 
  name: string;
  createdBy_id: string;
  structure: IStructure;
}


const project = {
  name: '',
  id: '',
  createdBy_id: '',
  columns: [
    { column: 0, name: '' },

  ],
  tasks: [
    { id: '', column: 0, taskName: '', description: '', status: '' },
  ]
}



const ListProject: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [idProject, setIdProject] = useState<string | null>(null)
  const [endDrag, setEndDrag] = useState(0);
  const [upload, setUpload] = useState(1);
  const {isShowing, toggle} = useModal()


  const [listOfProjects, setListOfProjects] = useState<IProjects[]>([])

  if (upload) {
    try {
      api.get('/projects').then(response => {setListOfProjects(response.data)})
      project.id = listOfProjects[0].id
      project.name = listOfProjects[0].name
      project.createdBy_id = listOfProjects[0].createdBy_id
      project.columns = listOfProjects[0].structure.columns
      project.tasks = listOfProjects[0].structure.tasks
      setIdProject(listOfProjects[0].id)
      setUpload(0)      

    }catch (err) {
      console.log(err)
    }
  }


  const handleClick = ((item: any) => {
    const choised = listOfProjects.filter(position => position.name === item.target.value)
    
      project.id = choised[0].id
      project.name = choised[0].name
      project.createdBy_id = choised[0].createdBy_id
      project.columns = choised[0].structure.columns
      project.tasks = choised[0].structure.tasks
      setIdProject(choised[0].id)
  })

   
  const cardList = (col: number) => {
    return project.tasks.filter(task => task.column === col);
  }


  const dropped = ((card: ICard) => {
    if (card.column !== endDrag) {
      const newColumns = project.tasks.filter(task => task.id !== card.id)

      const newCardPosition = {
        id: card.id,
        column: endDrag,
        taskName: card.taskName,
        status: card.status,
        description: card.description
      }
   
      newColumns.push(newCardPosition)
      project.tasks = newColumns
      setEndDrag(0)
      return
    }

    
  })
  
 
return (
  <Container>
    <Header>
    <HeaderContent>
      <img src={logoImg} alt="Easy Kanban" />

      <Profile>
        <img src={user.avatar_url} alt={user.name} />
          <div>
          <span>Bem-vindo,</span>
          <Link to="/profile">
            <strong>{user.name}</strong>
          </Link>
            <span>
            <strong>{project.name}</strong>    
            </span>
        </div>
      </Profile>
       
      <Menu>
        Choise project
        <select id='project' 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            (handleClick(e))
           } >
          
          {listOfProjects.map(item => (
            <option label={item.name}>{item.name}</option>

          ))} 

        </select>
      </Menu>
          
    </HeaderContent>
  </Header>

    <DragDropContext onDragEnd={() => ((true))}>

      <Droppable droppableId="droppable">
        {(provided) => (
          <Boards
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {project.columns.map(column => (
              <Board
                key={column.column}
                onDragOver={() => { setEndDrag(column.column) }}
              >
                <span>
                  {column.name}
                  {column.column === 1 && 
                    <>
                    <br/>
                    <Button type="button" onClick={toggle} >
                      Add task
                    </Button> 
                    </>
                  }   
                </span>
                <Dropzone className="dropzone">
                  {cardList(column.column).map(card => (
                    <>
                      <Card
                        key={card.column}
                        draggable="true"
                        onDragEnd={() => (dropped(card))}
                      >
                        <div>{card.taskName}</div>
                        {card.description}

                     
                        <Modal {...{ isShowing, toggle }}>
                        <ModalHeader {...{ toggle }}>
                          My Title
                        </ModalHeader>
                        <ModalBody>
                          Hello World!
                        </ModalBody>
                        <ModalFooter>
                          <button onClick={toggle}>
                            Cancel
                          </button>
                        </ModalFooter>
                        </Modal>

                      </Card>

                    </>
                  ))}
                </Dropzone>

              </Board>
            ))}
            {provided.placeholder}
          </Boards>
        )}

      </Droppable>

    </DragDropContext>
  </Container>

  );
}

export default ListProject;

