import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FiArrowLeft, AiFillProject, FiColumns } from 'react-icons/all';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';

import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { Link, useHistory } from 'react-router-dom';

import api from '../../services/api'
import { useToast } from '../../hooks/toast';
import getValidationErrors from '../../utils/getValidationErrors';
import logoImg from '../../assets/logo.svg';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Container, Content,
  Board,
  Boards,
  Dropzone,
  Card } from './styles';

const projects = {
  columns: [
    { column: 1, name: "to Do" },
    { column: 2, name: "in Progress" },
    { column: 3, name: "done" },

  ],
  tasks: [
    { id: "1", column: 1, taskName: "to Do", removable: false },
    { id: "2", column: 2, taskName: "in Progress", removable: false },
    { id: "3", column: 3, taskName: "done", removable: false },
  ]
}

interface ICard {
  id: string;
  column: number;
  taskName: string;
  removable: boolean;
}


interface IProjectFormData {
  name: string;
  newNumberOfColumns: number;
}

interface IEditName {
  name: string;
  newName: string;
  colNumber: number;
  
}


const NewProject: React.FC = () => {
  const [typing, setTyping] = useState(false)
  const [endDrag, setEndDrag] = useState(0);
  const [projectName, setProjectName] = useState<string>("New Project")
  const [newNames, setNewNames] = useState<IEditName[]>([])
  
  
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();
  
  const boardColumns = useMemo(() => {
    return projects.columns.sort((a, b) => (a.column < b.column) ? -1 : 1)
  }, [])

  const cardList = (col: number) => {
    return projects.tasks.filter(task => task.column === col);
  }

  const dropped = ((card: ICard) => {
    if (card.column !== endDrag) {
      const newColumns = projects.tasks.filter(task => task.id !== card.id)

      const newCardPosition = {
        id: card.id, 
        column: endDrag,
        taskName: card.taskName,
        removable: true,
      }
      newColumns.push(newCardPosition)
      projects.tasks = newColumns
      setEndDrag(0) 
      return
    }

  })

  const editName = async () => {
    try {
      projects.columns = []
      // projects.tasks = []
      newNames.map((column) => {
        const nameFound = boardColumns.findIndex(names => names.name === column.name)
        if (nameFound > -1) {
          boardColumns[nameFound].name = column.newName
          }

      }); 
        
      boardColumns.map((columns) => projects.columns.push(columns))

      const name = projectName

      const cards = 
       [ { 
          column: 1,
          taskName: "to Do",
          description: "Enter the description of the task here",
          blocked: false,
          whyBlocked: ''
        } ]

      const structure = JSON.stringify(boardColumns)
      const tasks = JSON.stringify(cards)

      const data = {name, structure, tasks}
      console.log(data)
     
      await api.post('/projects', data)

      history.push('/dashboard')

      addToast({
          type: 'success',
          title: 'success!',
          description: 'You can now start to use this project!',
      })

    }catch (err) {
      console.log(err)
      addToast({
        type: 'error',
        title: 'Error on recorder',
        description: 'One error trying to record. Please try again',
      });
    }

  }
  
  const handleSubmit = useCallback(
    async (data: IProjectFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Project name required'),
          newNumberOfColumns: Yup.number().min(3, 'At least 3 columns'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        setProjectName(data.name)
        setTyping(true)
        if (data.newNumberOfColumns > 3) {
          for (let i = 3; i < data.newNumberOfColumns; i++ ){
            const addColumn = {
              column: i + 1,
              name: "New Column",
            }
            projects.columns.push(addColumn)
            const newCardPosition = {
              id: " ",
              column: i + 1,
              taskName: "New Column",
              removable: true,
            }
            projects.tasks.push(newCardPosition)
          }
          setEndDrag(4)
        }

      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

 
      }
    },
    [addToast],
  );

  return (
    <Container>
      <Content>
          <img src={logoImg} alt="Easy Kanban" />

          <Form ref={formRef}  onSubmit={handleSubmit}>
            <h1>Start a project</h1>

            <Input name="name" disabled={typing} icon={AiFillProject} placeholder="Project name" />

            <Input name="newNumberOfColumns" disabled={typing} icon={FiColumns} placeholder="Number of columns" />

          
          <Button disabled={typing} type="submit">Submit</Button>
          </Form>

          <Link to="/">
            <FiArrowLeft />
             Back to Dashboard
          </Link>
      </Content>
   

      <DragDropContext onDragEnd={() => ((true))}>
        
        <Droppable droppableId="droppable">
          {(provided) => (
            <Boards 
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {boardColumns.map(column => (
                <Board 
                  key={column.column} 
                  onDragOver={() => { setEndDrag(column.column)}} 
                >
                 
                  <Dropzone className="dropzone">
                    {cardList(column.column).map(card => (
                      <Card 
                        key={card.column} 
                        className="card" 
                        draggable="true"
                        onDragEnd={() => (dropped(card))}
                      >
                        <input key={card.column} 
                          onChange={(e) => {
                            const nameFound = newNames.findIndex(names => names.name === column.name)
                            if (nameFound > -1) {
                              newNames[nameFound].newName = e.currentTarget.value;
                              newNames[nameFound].colNumber = card.column
                            } else {
                              const newName = {
                                name: column.name,
                                newName: e.currentTarget.value,
                                colNumber: card.column
                              }
                              newNames.push(newName)
                            }
                          }}
                        
                          placeholder={card.taskName}/>
                       
                      </Card>
                    ))}
                  </Dropzone>
    
                </Board>
              ))}
              {provided.placeholder}
            </Boards>
          )}

        </Droppable>  
          <button type="button" onClick={editName}>
            ok
          </button>
        
      </DragDropContext>
    </Container>



  );
};


export default NewProject;



