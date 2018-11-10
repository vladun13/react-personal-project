// Core
import React, { Component } from 'react';

// Instruments
import { api } from "../../REST";
import Styles from './styles.m.css';
import { sortTasksByGroup } from '../../instruments';
import Checkbox from '../../theme/assets/Checkbox';

// Components
import Task from '../../components/Task/index';
import Spinner from '../../components/Spinner/index';

export default class Scheduler extends Component {

    state = {
        tasks:           [],
        isTasksFetching: false,
        newTaskMessage:  '',
        tasksFilter:     '',
    };

    componentDidMount () {
        this._fetchTasksAsync();
    }
    _setTasksFetchingState = (isTasksFetching) => {
        this.setState({
            isTasksFetching,
        });
    };

    _updateTasksFilter = (event) => {
        const { value }  = event.target;

        this.setState({ tasksFilter: value.toLowerCase() });

        this._filterTask();
    };

    _filterTask = () => {
        const { tasks, tasksFilter } = this.state;

        if (tasksFilter) {
            const filteredUserTasks = tasks.filter((task) => {
                return task.message.toLowerCase().includes(tasksFilter);
            });

            return filteredUserTasks;
        }

        return null;

    };

    _fetchTasksAsync = async () => {
        try {
            this._setTasksFetchingState(true);
            const tasks = await api.fetchTasks();

            this.setState({
                tasks: sortTasksByGroup(tasks),
            });

        } catch ({ message }) {
            console.log(message);
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _createTaskAsync = async (event) => {
        event.preventDefault();
        const { newTaskMessage } = this.state;

        if (newTaskMessage) {
            try {
                this._setTasksFetchingState(true);

                const task = await api.createTask(newTaskMessage);

                this.setState((prevState) => ({
                    tasks:          sortTasksByGroup([task, ...prevState.tasks]),
                    newTaskMessage: '',
                }));
            } catch ({ message }) {
                console.log(message);
            } finally {
                this._setTasksFetchingState(false);
            }
        } else {
            return null;
        }

    };

    _removeTaskAsync = async (id) => {
        try {
            this._setTasksFetchingState(true);

            await api.removeTask(id);

            this.setState(({ tasks }) => ({
                tasks: tasks.filter((task) => task.id !== id),
            }));
        } catch ({ message }) {
            console.log(message);
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _updateTaskAsync = async (taskToUpdate) => {
        try {
            this._setTasksFetchingState(true);
            const { tasks } = this.state;
            const updatedTask = await api.updateTask(taskToUpdate);
            const index = tasks.findIndex((task) => task.id === taskToUpdate.id);

            const updatedTasks = tasks.map(
                (task, id) => id === index ? updatedTask : task
            );

            const sortedUpdatedTasks = sortTasksByGroup(updatedTasks);

            this.setState({
                tasks: sortedUpdatedTasks,
            });

        } catch ({ message }) {
            console.log(message);
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _getAllCompleted = () => {
        return this.state.tasks.every((task) => task.completed);
    };

    _completeAllTasksAsync = async () => {
        const incompleteTasks = this.state.tasks.filter((task) =>
            task.completed === false
        );

        if (incompleteTasks.length !== 0) {
            this._setTasksFetchingState(true);
            try {
                await api.completeAllTasks(incompleteTasks.map((task) => {
                    task.completed = true;

                    return task;
                }));
                this.setState(({ tasks }) => ({
                    tasks: tasks.map((task) => {
                        task.completed = true;

                        return task;
                    }),
                }));
            } catch ({ message }) {
                console.log(message);
            } finally {
                this._setTasksFetchingState(false);
            }
        } else {
            return null;
        }
    };

    _updateNewTaskMessage = (event) => {
        const { value : newTaskMessage }  = event.target;

        this.setState({ newTaskMessage });
    };

    render () {
        const { tasks, isTasksFetching, newTaskMessage, tasksFilter } = this.state;
        const _filteredTask = this._filterTask();
        const currentUserTasks = _filteredTask !== null ? _filteredTask : tasks;
        const isCheckBoxChecked = tasks.length ? this._getAllCompleted() : false;

        const tasksJsx = currentUserTasks.map((task) => {

            return (
                <Task
                    key = { task.id }
                    { ...task }
                    _removeTaskAsync = { this._removeTaskAsync }
                    _updateTaskAsync = { this._updateTaskAsync }
                />
            );

        });

        return (
	            <section className = { Styles.scheduler }>
	                <main>
	                <header>
	                    <h1>
	                        Планировщик задач
	                    </h1>
	                    <input
	                        placeholder = 'Поиск'
	                        type = 'search'
	                        value = { tasksFilter }
	                        onChange = { this._updateTasksFilter }
	                    />
	                </header>
		                <Spinner isSpinning = { isTasksFetching } />
		                    <section>
		                        <form
		                            onSubmit = { this._createTaskAsync }>
		                            <input
		                                className = { Styles.createTask }
		                                maxLength = { 50 }
		                                placeholder = 'Описaние моей новой задачи'
		                                type = 'text'
		                                value = { newTaskMessage }
		                                onChange = { this._updateNewTaskMessage }
		                            />
		                            <button>
		                                Добавить задачу
		                            </button>
		                        </form>
		                        <div className = { Styles.overlay }>
		                            <ul>
		                                { tasksJsx }
		                            </ul>
		                        </div>
		                    </section>
                    <footer>
                        <Checkbox
                            checked = { isCheckBoxChecked }
                            color1 = '#363636'
                            color2 = '#fff'
                            onClick = { this._completeAllTasksAsync }
                        />
                        <span className = { Styles.completeAllTasks }>
                            Все задачи выполнены
                        </span>
                    </footer>
                </main>
            </section>
        );
    }
}