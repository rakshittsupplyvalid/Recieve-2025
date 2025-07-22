import { StyleSheet } from 'react-native';

const ReimbTableViewStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  imageContainer: {
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
  },
});

export default ReimbTableViewStyles;
