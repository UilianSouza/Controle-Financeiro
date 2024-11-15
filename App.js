import { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import Moment from "moment";

function openDatabase() {
  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

export default function App() {
  const [despesas, setDespesas] = useState([]);
  const [text, setText] = useState(null);
  const [valor, setValor] = useState(null);

  Moment.locale("pt-BR");

  // Função para carregar despesas
  const carregarDespesas = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM despesas;",
        [],
        (_, { rows: { _array } }) => setDespesas(_array) // Atualiza o estado com as despesas
      );
    });
  };

  // Função para criar as tabelas se não existirem
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS despesas (id INTEGER PRIMARY KEY NOT NULL, done INTEGER, value TEXT, valor INTEGER, data DATE);"
      );
      carregarDespesas(); // Carrega as despesas ao iniciar o app
    });
  }, []);

  // Função para adicionar uma despesa
  const addDespesa = (text, valor) => {
    if (!valor || !text) return; // Verifica se valores estão vazios

    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO despesas (done, value, valor, data) VALUES (0, ?, ?, CURRENT_TIMESTAMP)", 
        [text, valor],
        () => {
          carregarDespesas(); // Atualiza as despesas após a inserção
        }
      );
    });
  };

  // Função para excluir uma despesa
  const excluirDespesa = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir esta despesa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => {
            db.transaction((tx) => {
              tx.executeSql("DELETE FROM despesas WHERE id = ?", [id], () => {
                carregarDespesas(); // Atualiza a lista de despesas após a exclusão
              });
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Controle Financeiro Fácil</Text>

      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQLite is not supported on web!
          </Text>
        </View>
      ) : (
        <View>
          <TextInput
            onChangeText={(text) => setText(text)}
            placeholder="Descrição"
            style={styles.input}
            value={text}
          />
          <TextInput
            onChangeText={(valor) => setValor(valor)}
            placeholder="Valor (R$)"
            style={styles.input}
            value={valor}
            keyboardType="numeric"
          />

          <Button
            title="Adicionar Despesa"
            onPress={() => {
              addDespesa(text, valor);
              setValor(null);
              setText(null);
            }}
          />
        </View>
      )}

      <ScrollView style={styles.listArea}>
        <Text style={styles.sectionHeading}>Despesas</Text>
        {despesas.map(({ id, done, value, valor, data }) => (
          <View key={id} style={styles.item}>
            <Text>{Moment(data).format("DD/MM/yyyy")}</Text>
            <Text>{value} - {valor}</Text>
            <TouchableOpacity onPress={() => excluirDespesa(id)}>
              <Text style={styles.deleteButton}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 80
  },
  input: {
    borderColor: "#000",
    borderRadius: 15,
    borderWidth: 1,
    height: 48,
    margin: 16,
    padding: 8,
    marginBottom: 20,
    marginTop: 20
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionHeading: {
    fontSize: 25,
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: "bold",
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 20
  },
});
