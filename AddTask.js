// AddTask.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTask = ({ navigation }) => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [priority, setPriority] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [reminderTone, setReminderTone] = useState(null);

  const requestPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') {
      Alert.alert('Permission not granted for notifications.');
    }
  };

  const addTask = async () => {
    if (task.length > 0) {
      const newTask = {
        text: task,
        completed: false,
        dueDate: dueDate.toISOString(), // Save as ISO string
        priority,
        imageUri,
        reminderTone,
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      const reminderTime = dueDate.getTime() / 1000; // Convert to seconds
      scheduleNotification(reminderTime, docRef.id);

      resetFields();
      navigation.navigate('ToDoList'); // Navigate back to the task list
    } else {
      Alert.alert('Please enter a task.');
    }
  };

  const resetFields = () => {
    setTask('');
    setDueDate(new Date());
    setPriority('');
    setImageUri(null);
    setReminderTone(null);
  };

  const scheduleNotification = async (time, id) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Reminder',
        body: `Reminder for task: ${id}`,
        sound: reminderTone ? reminderTone : undefined,
      },
      trigger: { seconds: time },
    });
  };

  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const playReminderTone = async () => {
    if (reminderTone) {
      const { sound } = await Audio.Sound.createAsync({ uri: reminderTone });
      await sound.playAsync();
    } else {
      Alert.alert('No reminder tone selected.');
    }
  };

  requestPermissions(); // Request notification permissions on component mount

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Task</Text>

      <Text style={styles.label}>Task:</Text>
      <TextInput
        placeholder="Add a new task"
        value={task}
        onChangeText={setTask}
        style={styles.input}
      />

      <Text style={styles.label}>Due Date:</Text>
      <Button title="Select Due Date" onPress={showDatePicker} />
      <Text>{`Selected Date: ${dueDate.toLocaleString()}`}</Text>
      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Priority (low, medium, high):</Text>
      <TextInput
        placeholder="Priority (low, medium, high)"
        value={priority}
        onChangeText={setPriority}
        style={styles.input}
      />

      <Text style={styles.label}>Reminder Tone (optional):</Text>
      <TextInput
        placeholder="Add reminder tone URI"
        value={reminderTone}
        onChangeText={setReminderTone}
        style={styles.input}
      />
      <Button title="Play Reminder Tone" onPress={playReminderTone} />

      <Text style={styles.label}>Attach an Image (optional):</Text>
      <Button title="Select Image" onPress={selectImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Button title="Add Task" onPress={addTask} />
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default AddTask;
