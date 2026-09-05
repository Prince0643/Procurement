import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'screens', 'CreateRequestScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!content.includes("@react-native-community/datetimepicker")) {
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport DateTimePicker from '@react-native-community/datetimepicker';"
  );
}

// 2. Add state
const stateMarker = "const [dateNeeded, setDateNeeded] = useState(new Date().toISOString().split('T')[0]);";
if (!content.includes("const [showDatePicker, setShowDatePicker]")) {
  content = content.replace(
    stateMarker,
    stateMarker + "\n  const [showDatePicker, setShowDatePicker] = useState(false);"
  );
}

// 3. Add handler
const handlerMarker = "const handleSelectItem = (item) => {";
if (!content.includes("const onChangeDate")) {
  content = content.replace(
    handlerMarker,
    `const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Need to adjust for timezone offset
      const offset = selectedDate.getTimezoneOffset();
      selectedDate = new Date(selectedDate.getTime() - (offset*60*1000));
      setDateNeeded(selectedDate.toISOString().split('T')[0]);
    }
  };

  ` + handlerMarker
  );
}

// 4. Update UI
const oldUI = `<View style={styles.formGroup}>
            <Text style={styles.label}>Date Needed *</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="calendar-today" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                value={dateNeeded}
                onChangeText={setDateNeeded}
              />
            </View>
          </View>`;

const newUI = `<View style={styles.formGroup}>
            <Text style={styles.label}>Date Needed *</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="calendar-today" size={20} color="#94a3b8" style={styles.inputIcon} />
                <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 12, color: dateNeeded ? '#0f172a' : '#94a3b8' }]}>
                  {dateNeeded || "YYYY-MM-DD"}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(dateNeeded || new Date())}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
          </View>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated mobile date picker');
