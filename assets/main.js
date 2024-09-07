document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:5000';  // Update this URL with your Flask API base URL

    const queryBtn = document.getElementById('queryBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const chatWindow = document.getElementById('chatWindow');  // Target chat window element
    const uploadResponse = document.getElementById('uploadResponse');
    const fileList = document.getElementById('fileList');

    // Function to append messages to the chat window
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        
        // Add class based on sender type (user or bot)
        messageDiv.classList.add('message', sender === 'user' ? 'message-user' : 'message-bot');
        
        // Create a text node for the message and append it
        const textNode = document.createTextNode(message);
        messageDiv.appendChild(textNode);
        
        // Append the message to the chat window
        chatWindow.appendChild(messageDiv);

        // Ensure the chat window auto-scrolls to the latest message
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Handle query request (now displayed as a chat)
    queryBtn.addEventListener('click', async () => {
        const queryText = document.getElementById('queryText').value;

        if (!queryText) {
            appendMessage('bot', 'Please enter a query!');
            return;
        }

        // Display user's query in the chat window
        
        try {
            appendMessage('user', queryText);
            // Make the API request to Flask
            const response = await axios.post(`${apiUrl}/query`, { query_text: queryText });

            // Display API's response in the chat window
            appendMessage('bot', response.data.response);
        } catch (error) {
            appendMessage('bot', 'Error: ' + error.response.data.error);
        }

        // Clear input field after sending the query
        document.getElementById('queryText').value = '';
    });

    // Handle file upload
    uploadBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            uploadResponse.textContent = 'Please select a file!';
            uploadResponse.classList.remove('d-none');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            uploadResponse.textContent = response.data.success;
            uploadResponse.classList.remove('d-none');
            loadFileList();  // Reload the file list after successful upload
        } catch (error) {
            uploadResponse.textContent = 'Error: ' + error.response.data.error;
            uploadResponse.classList.remove('d-none');
        }
    });

    // Load file list
    async function loadFileList() {
        try {
            const response = await axios.get(`${apiUrl}/files`);
            fileList.innerHTML = '';  // Clear the file list

            // Populate the file list with files from the server
            response.data.files.forEach(file => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
                listItem.textContent = file;

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => deleteFile(file));

                listItem.appendChild(deleteBtn);
                fileList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error loading file list:', error);
        }
    }

    // Handle file deletion
    async function deleteFile(filename) {
        try {
            const response = await axios.post(`${apiUrl}/delete`, { filename });
            alert(response.data.success);
            loadFileList();  // Reload the file list after successful deletion
        } catch (error) {
            alert('Error: ' + error.response.data.error);
        }
    }

    // Load the files list on page load
    loadFileList();
    console.log('BATATA ASSADA');
    
});
