import { WebSocket } from "ws";




export const addActiveUserSession = (report_id, websocket) => {
    
    if(!global.sessions_mapping.hasOwnProperty(report_id)){
        global.sessions_mapping[report_id] = [];
    }
    global.sessions_mapping[report_id].push(websocket);

}

export const sendNotificationToAllActiveSessions = (report_id, notification) => {
    
    if( !global.sessions_mapping.hasOwnProperty(report_id)) return;

    const to_delete = new Set();

    global.sessions_mapping[report_id].forEach((conn, index) => {
        if(conn.readyState !== WebSocket.CLOSED){


            const data = JSON.stringify(notification);

            conn.send(data);

            conn.close();
        }

        to_delete.add(index);
    });

    const active_sessions = global.sessions_mapping[report_id].filter((conn, index) => !to_delete.has(index));

    if(active_sessions.length > 0) global.sessions_mapping[report_id] = active_sessions;
    else delete global.sessions_mapping[report_id];

}