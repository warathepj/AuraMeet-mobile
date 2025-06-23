import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function UploadScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Page</Text>
      <Text>This is the upload screen.</Text>
      <Button
        title="Upload Excel File"
        onPress={async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // For .xlsx files
              copyToCacheDirectory: false,
            });

            if (result.canceled) {
              console.log('Document picking cancelled');
            } else {
              const fileUri = result.assets[0].uri;
              const fileName = result.assets[0].name;
              const fileType = result.assets[0].mimeType;

              const formData = new FormData();
              
              // Fetch the file content as a Blob
              const fileResponse = await fetch(fileUri);
              const fileBlob = await fileResponse.blob();

              formData.append('file', fileBlob, fileName); // Append blob with filename

              try {
                const response = await fetch('http://localhost:8000/upload-excel/', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    // 'Content-Type': 'multipart/form-data', // React Native's fetch automatically sets boundary
                  },
                });

                const responseData = await response.json();
                if (response.ok) {
                  console.log('File upload successful:', responseData);
                  alert(`File uploaded: ${responseData.message}`);
                } else {
                  console.error('File upload failed:', responseData);
                  alert(`File upload failed: ${responseData.message}`);
                }
              } catch (uploadError) {
                console.error('Error uploading file:', uploadError);
                alert('Error uploading file. Please try again.');
              }
            }
          } catch (err) {
            console.error('Error picking document:', err);
            alert('Error picking document. Please try again.');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
