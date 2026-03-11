import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const res = await API.get("/admin/auth/room/getall");
      if (res.data.success) setRooms(res.data.rooms);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rooms");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Add a room
  const handleAddRoom = async () => {
    if (!roomName.trim()) return toast.error("Enter room name");
    try {
      const res = await API.post("/admin/auth/room/add", { name: roomName });
      if (res.data.success) {
        toast.success("Room added");
        setRoomName("");
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add room");
    }
  };

  // Delete a room
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await API.delete(`/admin/auth/room/${id}/delete`);
      toast.success("Room deleted");
      fetchRooms();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete room");
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Rooms</CardTitle>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="border rounded-md p-1"
            />
            <Button onClick={handleAddRoom}>+ Add Room</Button>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-gray-500">No rooms found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{room.name}</td>
                      <td className="p-2 border text-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(room._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomList;
