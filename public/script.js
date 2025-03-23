const socket = io("http://localhost:3000");

socket.on("userData", (data) => {
    console.log("Received user data:", data);

    const tableBody = document.getElementById("userTable");
    tableBody.innerHTML = ""; // Clear previous data

    data.forEach((user) => {
        const row = `<tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.age}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
});
