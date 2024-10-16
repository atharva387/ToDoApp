import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { db } from './firebaseConfig';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions'; // Add this import

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [reminder, setReminder] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    });

    const requestPermissions = async () => {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== 'granted') {
        Alert.alert('Permission not granted for notifications.');
      }
    };

    requestPermissions();

    return () => unsubscribe();
  }, []);

  const addTask = async () => {
    if (task.length > 0) {
      const docRef = await addDoc(collection(db, 'tasks'), { text: task, completed: false });
      scheduleNotification(parseInt(reminder), docRef.id); // Convert reminder to integer
      setTask('');
      setReminder('');
    } else {
      Alert.alert('Please enter a task.');
    }
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const scheduleNotification = async (time, id) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Reminder for task: ${id}`,
      },
      trigger: { seconds: time }, // Set the trigger time here
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <TextInput
        placeholder="Add a new task"
        value={task}
        onChangeText={setTask}
        style={styles.input}
      />
      <TextInput
        placeholder="Set reminder (in seconds)"
        value={reminder}
        onChangeText={setReminder}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Task" onPress={addTask} />
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.text}</Text>
            <Button title="Delete" onPress={() => deleteTask(item.id)} />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default TodoList;
