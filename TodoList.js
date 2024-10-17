// ToDoList.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from './firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { FloatingAction } from "react-native-floating-action";

const ToDoList = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>
        {item.text}
      </Text>
      <Text>Due: {item.dueDate || 'N/A'}</Text>
      <Text>Priority: {item.priority || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <FloatingAction
        actions={[
          {
            text: "Add Task",
            icon: require('./assets/add.png'), // Ensure you have an icon in the assets folder
            name: "bt_add_task",
            position: 1
          }
        ]}
        onPressItem={() => {
          navigation.navigate('AddTask');
        }}
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
  taskItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default ToDoList;
