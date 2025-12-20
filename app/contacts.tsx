import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import * as Contacts from 'expo-contacts';


let x = {
  "lastName": "Iroka",
  "contactType": "person",
  "isFavorite": false,
  "imageAvailable": false,
  "id": "1032",
  "name": "Chinwoke Iroka",
  "firstName": "Chinwoke",
  "phoneNumbers": [{
    "number": "08080582506",
    "isPrimary": 1,
    "id": "2830",
    "type": "2",
    "label": "mobile"
  }],
  "lookupKey": "2288i69"
}

type ContactType = {
  id: string;
  name?: string;
  phoneNumbers?: { id: string, number: string }[];
  // you can include more fields as desired
};

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access contacts was denied');
          setLoading(false);
          return;
        }
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });
        if (data.length === 0) {
          setError('No contacts found');
        } else {
          setContacts(data);
        }
      }
      catch (e: any) {
        console.error('Contacts load error:', e);
        setError('Failed to load contacts');
      }
      finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) {
    return (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={60} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contactItem}
            onPress={() => {
              alert(item.name)
            }}
          >
            <Text style={styles.nameText}>{item.name}</Text>
            {item.phoneNumbers?.map((p, i) => (
              <Text key={p.id} style={styles.phoneText}>{p.number}</Text>
            ))}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  indicatorContainer: { flex: 1, justifyContent: "center" },
  contactItem: { marginVertical: 8 },
  nameText: { fontSize: 16, fontWeight: 'bold' },
  phoneText: { fontSize: 14, color: 'gray' },
  errorText: { color: 'red', textAlign: 'center', marginVertical: "auto" },
});