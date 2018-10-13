import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? '#c9e8ff' : 'white',
    ...draggableStyle,
});

export const RoutersList = (props) => {
    return (
        <DragDropContext onDragEnd={props.onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <div
                        className='routeList'
                        ref={provided.innerRef}
                    >
                        <Item routers={props.routers}
                              deleteRoute={props.deleteRoute}/>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
};


const Item = (props) => {
    return (
    props.routers.map((item, index) => (
        <Draggable key={item.id} draggableId={item.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className="router"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                    )}
                >
                    {item.text}
                    <span key={item.id}
                         onClick={() => props.deleteRoute(item.id)}
                         className="deleteButton">
                         &times;
                    </span>
                </div>
            )}
        </Draggable>
    )))
};

