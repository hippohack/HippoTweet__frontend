import React, { useState, useEffect, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { TextField } from 'app/src/components/atoms/TextField';
import ImagePicker from 'app/src/components/atoms/ImagePicker';
import Button from 'app/src/components/atoms/Button';
import { COLOR } from 'app/src/constants/theme';
import post from 'app/src/lib/post';
import { inputCount } from 'app/src/lib/inputCount';
import { retrieveData } from 'app/src/lib/localStorage';
import verifyCredentials from 'app/src/lib/verifyCredentials';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  textField: {
    minHeight: 160,
    maxHeight: 'auto',
    textAlignVertical: 'top',
    borderColor: COLOR.MAIN,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 18,
    marginTop: 10,
  },
  buttonWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  button: {
    height: 30,
    width: 100,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  // eslint-disable-next-line react-native/no-color-literals
  alert: {
    borderWidth: 1,
    borderColor: '#b8daff',
    borderRadius: 3,
    padding: 5,
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#004085',
    backgroundColor: '#cce5ff',
  },
  // eslint-disable-next-line react-native/no-color-literals
  errorAlert: {
    borderWidth: 1,
    borderColor: '#f13d3d',
    borderRadius: 3,
    padding: 5,
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#921e1e',
    backgroundColor: '#f7b9b9',
  },
});

export default () => {
  const [status, onChangeText] = React.useState('');
  const [auth, setAuth] = useState();
  const [alert, setAlert] = useState();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [count, setCount] = useState(0);
  const [isSubmitting, setSubmitting] = useState(false);
  const [verifyCredential, setVerifyCredential] = useState(false);

  const overCharactersErrorText = 'Character count over.';
  // const iconName = 'ios-trash';
  const iconName = 'ios-close';
  const fadeAnim = useRef(new Animated.Value(5)).current;
  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };
  const handler = () => {
    setHasImage(true);
  };

  useEffect(() => {
    retrieveData('TWITTER_TOKEN').then(result => {
      // console.log({ result });
      setAuth(result);
    });

    Keyboard.addListener('keyboardDidShow', () => {
      setShowKeyboard(true);
    });

    Keyboard.addListener('keyboardDidHide', () => {
      setShowKeyboard(false);
    });
  }, []);

  if (alert) {
    setTimeout(() => {
      fadeOut();
      // setAlert(null);
    }, 2000);
  }

  // FIXME: とりま放置
  // トークンの有効確認
  // if (auth && !verifyCredential) {
  //   console.log({ verifyCredential });
  //   verifyCredentials({ auth }).then(result => {
  //     if (!result) {
  //       return <Text>error!! you do not have authentication.</Text>;
  //     }
  //     setVerifyCredential(result);
  //   });
  // }

  if (!auth) {
    return <Text>error!! you do not have authentication.</Text>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'position'} style={styles.container}>
      <TouchableWithoutFeedback>
        <View style={{ marginTop: showKeyboard && hasImage ? 60 : 0 }}>
          <View style={styles.buttonWrap}>
            <View style={{ paddingLeft: 5 }}>
              <Ionicons
                name={iconName}
                size={36}
                color={COLOR.MAIN}
                onPress={() => {
                  onChangeText('');
                  setCount(0);
                }}
              />
            </View>
            <Button
              style={styles.button}
              textStyle={styles.buttonText}
              label="Tweet"
              disabled={isSubmitting}
              loading={isSubmitting}
              onPress={() => {
                setSubmitting(true);
                if (count > 140) {
                  setAlert(overCharactersErrorText);
                  return false;
                }
                post({ auth, status }).then(res => {
                  // console.log('res', res._headers.status);
                  setAlert('Tweeted.');
                  onChangeText('');
                  setCount(0);
                  setSubmitting(false);
                });
              }}
            />
          </View>
          <TextField
            label="What's going on?"
            value={status}
            style={styles.textField}
            onChangeText={text => {
              // console.log(inputCount(text, 'UTF-8'));
              setCount(inputCount(text, 'UTF-8'));
              onChangeText(text);
            }}
          />
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {/* TODO: Count */}
            <Text
              style={{
                textAlign: 'right',
                marginTop: Platform.OS === 'ios' ? 5 : 0,
                color: count > 140 ? 'red' : null,
              }}
            >
              {count}/140
            </Text>
          </View>
          {/* TODO: pend */}
          {/* <ImagePicker action={handler} auth={auth} /> */}
        </View>
      </TouchableWithoutFeedback>
      <Animated.View style={{ opacity: fadeAnim }}>
        {alert && <Text style={alert === overCharactersErrorText ? styles.errorAlert : styles.alert}>{alert}</Text>}
      </Animated.View>
    </KeyboardAvoidingView>
  );
};
