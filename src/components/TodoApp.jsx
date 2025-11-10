import React, { useState, useEffect } from 'react';
import './TodoApp.css'; // Moved styles to a separate CSS file

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('todoTasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('todoTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  const addTask = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return setError('Task cannot be empty');
    if (trimmedValue.length > 100) return setError('Task cannot exceed 100 characters');
    if (tasks.some(task => task.text.toLowerCase() === trimmedValue.toLowerCase())) {
      return setError('Task already exists');
    }
    const newTask = {
      id: Date.now() + Math.random(),
      text: trimmedValue,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
    setError('');
  };

  const removeTask = id => setTasks(tasks.filter(task => task.id !== id));
  const toggleComplete = id => setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));

  const getFilteredTasks = () => {
    if (filter === 'active') return tasks.filter(t => !t.completed);
    if (filter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  };

  const getSortedTasks = filtered => {
    if (sortBy === 'oldest') return [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === 'alphabetical') return [...filtered].sort((a, b) => a.text.localeCompare(b.text));
    if (sortBy === 'completed') return [...filtered].sort((a, b) => a.completed - b.completed);
    return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const displayedTasks = getSortedTasks(getFilteredTasks());

  const handleKeyPress = e => {
    if (e.key === 'Enter') addTask();
  };

  const clearCompleted = () => setTasks(tasks.filter(task => !task.completed));

  const completedCount = tasks.filter(task => task.completed).length;
  const activeCount = tasks.filter(task => !task.completed).length;

  return (
    <div className="todo-container">
      <div className="todo-app">
        <header className="todo-header">
          <h1>✨ Todo List</h1>
          <p>Stay organized and productive</p>
        </header>

        <div className="todo-input-section">
          <div className="todo-input-wrapper">
            <input
              type="text"
              className={`todo-input ${error ? 'error' : ''}`}
              placeholder="Add a new task..."
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
            />
            <button className="todo-add-btn" onClick={addTask}>+ Add</button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="todo-stats">
          <span>Total: {tasks.length}</span>
          <span>Active: {activeCount}</span>
          <span>Completed: {completedCount}</span>
        </div>

        <div className="todo-controls">
          <div>
            <label>Filter:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label>Sort by:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="completed">Completed Last</option>
            </select>
          </div>
          {completedCount > 0 && (
            <button className="todo-clear-btn" onClick={clearCompleted}>Clear Completed</button>
          )}
        </div>

        <div className="todo-list">
          {displayedTasks.length === 0 ? (
            <div className="todo-empty">
              <div>🎯</div>
              <h3>{tasks.length === 0 ? 'No tasks yet!' : 'No tasks match your filter'}</h3>
              <p>{tasks.length === 0 ? 'Add your first task to get started' : 'Try adjusting your filter or sort options'}</p>
            </div>
          ) : (
            displayedTasks.map(task => (
              <div className={`todo-task ${task.completed ? 'completed' : ''}`} key={task.id}>
                <div>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} />
                  <span>{task.text}</span>
                </div>
                <div>
                  <small>{new Date(task.createdAt).toLocaleDateString()}</small>
                  <button className="delete-btn" onClick={() => removeTask(task.id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
