import React, { useCallback, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { FormHandles } from '@unform/core';
import { Link } from 'react-router-dom';
import { Form } from '@unform/web';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';

import getValidationErrors from '../../utils/getValidationErrors';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';
import logoImg from '../../assets/logo.svg';
import TextArea from '../../components/TextArea';
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api'

import ModalCard, {useModal} from '../../components/Card'

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
  ConfirmButtons,
} from './styles';

interface ICard {
  id: string;
  column: number;
  taskName: string;
  description: string;
  status: string;
  blocked: boolean;
  whyBlocked: string;
}

interface IProjects {
  id: string; 
  name: string;
  createdBy_id: string;
  structure: { column: number; name: string; }[];
  
  tasks: ICard[];
}


const project = {
  name: '',
  id: '',
  createdBy_id: '',
  structure: [
    { column: 0, name: '' },
  ],
  tasks: [
    {
      id: '',
      column: 0,
      taskName: '',
      description: '',
      status: '',
      blocked: false,
      whyBlocked: '',
    }
  ]
}

const ListProject: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isBlocked, setIsBlocked] = useState(false)
  const [idProject, setIdProject] = useState<string | null>(null)
  const [cardToEdit, setCardToEdit] = useState<ICard>()
  const [changeProject, setChangeProject] = useState(false)
  const [endDrag, setEndDrag] = useState<number>(1);
  const [upload, setUpload] = useState(1);
  const {isShowing, toggle} = useModal()

  const formRef = useRef<FormHandles>(null);

  const [listOfProjects, setListOfProjects] = useState<IProjects[]>([])

 
  if (upload) {
    try {
      api.get('/projects').then(response => {setListOfProjects(response.data)})
      project.id = listOfProjects[0].id
      project.name = listOfProjects[0].name
      project.createdBy_id = listOfProjects[0].createdBy_id
      project.structure = listOfProjects[0].structure
      project.tasks = listOfProjects[0].tasks
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
    project.structure = choised[0].structure
    project.tasks = choised[0].tasks

    setIdProject(choised[0].id)
  })


  const dropped = ((card: ICard) => {
    if (card.column !== endDrag) {
      const newColumns = project.tasks.filter(task => task.id !== card.id)

      const newCardPosition = {
        id: card.id,
        column: endDrag,
        taskName: card.taskName,
        status: card.status,
        description: card.description,
        blocked: card.blocked,
        whyBlocked: card.whyBlocked,
      }
   
      newColumns.push(newCardPosition)
      project.tasks = newColumns
      setEndDrag(0)

      return
    }

    
  })
  
  const handleSave = useCallback(
    async (data: ICard) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          taskName: Yup.string().required('Card name required'),
          description: Yup.string().required('Description required'),
          blocked: Yup.bool(),
          whyBlocked: Yup.string()

        });
      
        await schema.validate(data, {
          abortEarly: false,
        });

        const updatedTasks =  project.tasks.findIndex(task => task.id === data.id);
        
        if (updatedTasks < 0) {
          const newCard = {
            id: data.id,
            column: 1,
            taskName: data.taskName,
            status: '',
            description: data.description,
            blocked: data.blocked,
            whyBlocked: data.whyBlocked
          }
          project.tasks.push(newCard)

        } 
        
        if (updatedTasks >= 0 ) {
          project.tasks[updatedTasks].taskName = data.taskName
          project.tasks[updatedTasks].description = data.description
          project.tasks[updatedTasks].blocked = data.blocked
          project.tasks[updatedTasks].whyBlocked = data.whyBlocked
        }

        setChangeProject(true)

        return true

      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          console.log(err)
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return
        }
      }

    }, [])

const addNewCard = () => {

  setCardToEdit(() => {
   const card = {

      id: uuid(),
      column: 1,
      taskName: '',
      status: '',
      description: '',
      blocked: false,
      whyBlocked: '',
      }
    return card as ICard
  })

  toggle()

}

const editCard = (id: string) => {
  const foundTask = project.tasks.findIndex(task => task.id === id)
  setCardToEdit({
    id: project.tasks[foundTask].id,
    column: project.tasks[foundTask].column,
    taskName: project.tasks[foundTask].taskName,
    status: project.tasks[foundTask].status,
    description: project.tasks[foundTask].description,
    blocked: project.tasks[foundTask].blocked,
    whyBlocked: project.tasks[foundTask].whyBlocked,
  })
  toggle()
}


const handleProjectSave = async () => {
  try {


    const data = project
    console.log(data)
    await api.put('/projects', data)

    addToast({
      type: 'success',
      title: 'success!',
      description: 'Project updated!',
    })

    
  } catch (err) {
    console.log(err)
    addToast({
      type: 'error',
      title: 'Error on recorder',
      description: 'One error trying to record. Please try again',
    });
  }

}
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
            <option hidden={changeProject} label={item.name}>{item.name}</option>

          ))} 

        </select>
      </Menu>

      <ConfirmButtons>
        <button type="button" onClick={handleProjectSave}>
            Save Changes
        </button>
      </ConfirmButtons>

      <ConfirmButtons>
        <button type="button" onClick={() => setChangeProject(false)} >
            Cancel Changes
        </button> 
      </ConfirmButtons>


          
    </HeaderContent>
  </Header>

    <DragDropContext onDragEnd={() => ((true))}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <Boards
          ref={provided.innerRef}
          {...provided.droppableProps}
          >
            {project.structure.map(column => (
              <Board
              key={column.column}
              onDragOver={() => { setEndDrag(column.column) }}
              >
                <span>
                  {column.name}
                  {column.column === 1 && 
                    <>
                    <br/>
                    <Button type="button" onClick={addNewCard} >
                      Add task
                    </Button> 
                    </>
                  }   
                </span>
                <Dropzone className="dropzone">
                  {project.tasks.map(card => {
                    if (card.column === column.column) {
                      return (
                        <Card
                        key={card.column}
                        className="card"
                        draggable="true"
                        onDragEnd={() => (dropped(card))}
                        >
                          <button onClick={() => editCard(card.id)}>
                        
                            {card.taskName}
                            {card.description}
                          </button>

                        </Card>)
                      }
                    }
                  )}
                </Dropzone>
              </Board>
            ))}
            {provided.placeholder}
          </Boards>
        )}
     
      </Droppable>

    </DragDropContext>

    <ModalCard {...{ isShowing, toggle }}>
      <Form 
      ref={formRef} 
      initialData = {{

        id: cardToEdit?.id,
        column: cardToEdit?.column,
        taskName: cardToEdit?.taskName,
        status: cardToEdit?.status,
        description: cardToEdit?.description,
        blocked: cardToEdit?.blocked,
        whyBlocked: cardToEdit?.whyBlocked,
      }}

      onSubmit={async (e) => {
        if (await handleSave(e)) toggle()
        
      }}
      >
        ModalBody, ModalFooter, 
          <Input name="id" value={cardToEdit?.id}/>
       
          <Input name="taskName" contentEditable={true}  placeholder="New card name" />
        <TextArea name="description" contentEditable={true} rows={10} placeholder="Task description"/>

        Block this task :
        <input name="blocked" type="checkbox" onChange={() => setIsBlocked(!isBlocked)} />
        <TextArea name="whyBlocked"  contentEditable={true} defaultValue={cardToEdit?.whyBlocked} rows={6} disabled={!isBlocked} placeholder="Block motivation" />

        <button type="submit" >
          Save
        </button>
        <button type="button" onClick={toggle} >
          Cancel
        </button> 
          
          
      </Form>
    </ModalCard>
   
  </Container>

  );
}

export default ListProject;
