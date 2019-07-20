import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput
} from "react-native";

class PhoneInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone_number: null
    };
  }
  static navigationOptions = {
    header: null
  };
  sendOtp = phone_number => {
    fetch("https://api.ringcaptcha.com/1igu6onu8ite2aza8eda/code/sms", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: `phone=${phone_number}&api_key=d3fb699623fdde7ba6ee8d010893edfe02c01f3c`
    }).then(res => {
      alert("OTP will delivery soon checking in next screen");
      this.props.navigation.navigate("OTPVerfication", {
        phone_number: phone_number,
        username: this.props.navigation.getParam("username")
      });
    });
  };
  redirectTo = phone_number => {};
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          One more thing please prove your are human{" "}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="input phone number"
          onChangeText={phone_number =>
            this.setState({ phone_number: phone_number })
          }
        />
        <View style={styles.btnContiner}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.sendOtp(this.state.phone_number)}
          >
            <Text style={styles.btntext}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    bottom: 66
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    fontWeight: "300"
  },
  input: {
    width: "90%",
    backgroundColor: "skyblue",
    padding: 15,
    marginBottom: 10
  },
  btnContiner: {
    flexDirection: "row",
    justifyContent: "center",
    width: "80%"
  },
  btn: {
    backgroundColor: "orange",
    padding: 15,
    width: "45%",
    marginLeft: 10
  },
  btntext: { fontSize: 16, textAlign: "center" },
  logo: {
    flexDirection: "row"
  }
});
export default PhoneInput;
