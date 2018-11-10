// Core
import React, { PureComponent, createRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

// Instruments
import Styles from './styles.m.css';

//Components
import Checkbox from '../../theme/assets/Checkbox';
import Edit from '../../theme/assets/Edit';
import Remove from '../../theme/assets/Remove';
import Star from '../../theme/assets/Star';

export default class Task extends PureComponent {

    state = {
        isTaskEditing: false,
        newMessage: this.props.message,
    };

    taskInput = createRef();

    _getTaskShape = ({
        id = this.props.id,
        completed = this.props.completed,
        favorite = this.props.favorite,
        message = this.props.message,
    }) => ({
        id,
        completed,
        favorite,
        message,
    });


    _setTaskEditingState = (isTaskEditing) => {
        this.setState(
        {
            isTaskEditing,
        },
        () => {
            if(isTaskEditing) {
                this.taskInput.current.focus();
            }
        },
    );
};

    _updateNewTaskMessage = (event) => {

        this.setState({
            newMessage: event.target.value,
        });
    };


    _updateTask = () => {
        const { _updateTaskAsync, message } = this.props;
        const { newMessage } = this.state;

        if(message === newMessage) {
            this._setTaskEditingState(false);
            
            return null;    
        }

        _updateTaskAsync(this._getTaskShape({ message: newMessage }));
        this._setTaskEditingState(false);

    };


    _updateTaskMessageOnClick = () => {
        const { isTaskEditing } = this.state;

        if(isTaskEditing) {
            this._updateTask();

            return null;
        }

        this._setTaskEditingState(true);
    };

    _updateTaskMessageOnKeyDown = (event) => {
        const { newMessage } = this.state;

        if(!newMessage.length) {
            return null;    
        }

        switch(event.key) {
            case 'Enter':{
                this._updateTask();
                break;
            }

            case 'Escape':{
                this._cancelUpdatingTaskMessage();
                break;
            }

            default:
                break;
            }
    };

    _cancelUpdatingTaskMessage = () => {
        const { message } = this.props;

        this.setState({
            newMessage: message,
            isTaskEditing: false,
        });
    };

    _toggleTaskCompletedState = () => {
        const { _updateTaskAsync, completed } = this.props;

        const taskToUpdate = this._getTaskShape({ completed: !completed });
        
        _updateTaskAsync(taskToUpdate);
    };

    _toggleTaskFavoriteState = () => {
        const { _updateTaskAsync, favorite } = this.props;

        const taskToUpdate = this._getTaskShape({ favorite: !favorite });
        
        _updateTaskAsync(taskToUpdate);
    };


    _removeTask = () => {
        const { _removeTaskAsync, id } = this.props;

        _removeTaskAsync(id);
    };


    render () {
        const { completed, favorite, message } = this.props;
        const { isTaskEditing, newMessage } = this.state;
        const currentMessage = isTaskEditing ? newMessage : message;

        return (
                <li className = { cx(Styles.task, {
                    [Styles.completed]: completed,
                }) }>
                        <div className = { Styles.content }>
                            <Checkbox
                                inlineBlock
                                checked = { completed }
                                className = { Styles.toggleTaskCompletedState }
                                color1 = '#3B8EF3'
                                color2 = '#FFF'
                                onClick = { this._toggleTaskCompletedState }  
                            />                          
                            <input 
                                disabled
                                maxLength = { 50 }
                                ref = { this.taskInput }    
                                type = "text"
                                value = { currentMessage }
                                onChange = { this._updateNewTaskMessage }
                                onKeyDown = { this._updateTaskMessageOnKeyDown }
                            />
                        </div>
                        <div className = { Styles.actions }>
                            <Star
                                inlineBlock
                                checked = { favorite }
                                className = { Styles.toggleTaskFavoriteState }
                                color1 = '#3B8EF3'
                                color2 = '#000'
                                onClick = { this._toggleTaskFavoriteState }
                            />
                            <Edit
                                inlineBlock
                                checked = { isTaskEditing }
                                className = { Styles.updateTaskMessageOnClick }
                                color1 = '#3B8EF3'
                                color2 = '#000'
                                onClick = { this._updateTaskMessageOnClick }
                            />
                            <Remove
                                inlineBlock
                                className = { Styles.removeTask }
                                color1 = '#3B8EF3'
                                color2 = '#000'
                                onClick = { this._removeTask }
                            />                     
                        </div>
                    </li>
                );
            }
        }
