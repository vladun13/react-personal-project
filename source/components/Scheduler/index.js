// Core
import React, { Component } from 'react';

// Instruments
import Styles from './styles.m.css';
import { api } from '../../REST'; 
import { sortTasksByGroup } from '../../instruments';
import Checkbox from '../../theme/assets/Checkbox';

//Components
import Task from '../../components/Task/index';
import Spinner from '../../components/Spinner/index';

export default class Scheduler extends Component {

	state = {
		tasks: [],
		isTasksFetching: false,
		newTaskMessage: '',
		tasksFilter: 	'',
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
		const { value } = event.target;

		this.setState({
			tasksFilter: value.toLowerCase()
		});

		this._filteredTask();
	};

	_filteredTask = () => {
		const { tasks, tasksFilter } = this.state;

		if (tasksFilter) {
			const tasksFilteredByUsers = tasks.filter((task) => {
				return task.message.toLowerCase().includes(tasksFilter);
			})

			return tasksFilteredByUsers;
		}

		return null;
	};

	_fetchTasksAsync = async () => {
		try {
			this._setTasksFetchingState(true);
			const tasks = await api.fetchedTasks();

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

		if(newTaskMessage) {
			try {
				this._setTasksFetchingState(true);

				const task = await api.createTask(newTaskMessage);

				this.setState((prevState) => ({
					tasks: sortTasksByGroup([task, ...prevState.tasks]),
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
			console.error(message);
		} finally {
			this._setTasksFetchingState(false);
		}
	};

	_updateTaskAsync = async (taskForUpdating) => {
		try {
			this._setTasksFetchingState(true);
			const { tasks } = this.state;
			const updatedTask = await api.updateTask(taskForUpdating);
			const index = tasks.findIndex((task) => task.id === taskForUpdating.id);

			const updatedTasks = tasks.map(
				(task, id) => id === index ? updatedTask : task
			);

			const sortUpdatedTasks = sortTasksByGroup(updatedTasks);

			this.setState({
				tasks: sortUpdatedTasks,
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
		const uncompletedTasks = this.state.tasks.filter((task) => 
			task.completed === false
		);

		if(uncompletedTasks.length !== 0) {
			this._setTasksFetchingState(true);

			try {
				await api._finishAllTasks(uncompletedTasks.map((task) => {
					task.completed = true;

					return task;
				}));

				this.setState(({ tasks }) => ({
					tasks: tasks.map((task) => {
						task.completed = true;

						return task;
					})
				}))
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
		const { value : newTaskMessage } = event.target;

		this.setState({ newTaskMessage });
	}

    render () {

    	const { tasks, isTasksFetching, newTaskMessage, tasksFilter } = this.state;
    	const filteredTask = this._filteredTask();
    	const currentTasks = filteredTask !== null ? filteredTask : tasks;
    	const isCheckboxChecked = tasks.length ? this._getAllCompleted() : false;

    	const tasksJSX = currentTasks.map((task) => {

    		return(
    			<Task 
    				key = { task.id }
    				{ ...task }
    				_removeTaskAsync = { this._removeTaskAsync }
    				_updateTaskAsync = { this._updateTaskAsync }
    			/>
			);
    	})

        return (
            <section className = { Styles.scheduler }>
                <main>
                	<Spinner isSpinning = { isTasksFetching }/>
                		<header>
                			<h1>
	                            Планировщик задач
                			</h1>
                			<input 
                				placeholder = "Поиск"
                				type = "search"
                				value = { tasksFilter }
                				onChange = { this._updateTasksFilter }
            				/>
                		</header>
                		<section>
                			<form 
                				onSubmit = { this._createTaskAsync }>
                				<input
                					className = { Styles.createTask }
                					maxLength = { 50 }
                					placeholder = "Описaние моей новой задачи" 
                					type = "text"
                					value = { newTaskMessage }
                					onChange = { this._updateNewTaskMessage }
                					/>
                					<button>
                						Добавить задачу
                					</button>
                			</form>
                			<div className = { Styles.overlay }>
                				<ul>
                					{ tasksJSX }
                				</ul>
                			</div>
                		</section>
                		<footer>
                			<Checkbox
                				checked = { isCheckboxChecked }
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
