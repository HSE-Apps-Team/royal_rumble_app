"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogoButton from "../../../components/logoButton";
import LoginButton from "../../../components/loginButton";
import AddButton from "../../../components/addButton";
import "../../../css/admin.css";
import "../../../css/logo+login.css";
import { addCustomGroup } from "../../../../actions/group";
import { useAlert } from "@/app/context/AlertContext";

export default function AdminAddFreshmenGroupPage(props: {
  orders: string[][];
}) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const handleLogoClick = () => {
    router.push("/admin/all_groups");
  };

  const [groupName, setGroupName] = useState("");
  const [eventOrder, setEventOrder] = useState("");
  const [routeNumber, setRouteNumber] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!groupName.trim()) newErrors.groupName = "Group name is required.";
    if (!eventOrder) newErrors.eventOrder = "Please select an event order.";
    if (!routeNumber.trim()) {
      newErrors.routeNumber = "Route number is required.";
    } else if (!/^\d+$/.test(routeNumber) || parseInt(routeNumber) <= 0) {
      newErrors.routeNumber = "Route number must be a positive integer.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGroup = async () => {
    if (!validate()) return;

    const result = await addCustomGroup(
      groupName,
      eventOrder.split(", "),
      parseInt(routeNumber),
    );
    showAlert(`Group "${result[0].name}" added successfully!`, "success");
    router.push("/admin/all_groups");
  };

  return (
    <main className="admin-container">
      <LogoButton />
      <LoginButton />

      <header className="admin-header">
        <h1 className="admin-title">Add New Group</h1>
      </header>

      <button className="back-button" onClick={handleLogoClick}>
        <i className="bi bi-arrow-left"></i>
      </button>

      <section className="add-form">
        <div className="edit-user-form">
          <div className="form-row">
            <label className="form-label">Group Name:</label>
            <div>
              <input
                type="text"
                className={`form-input${errors.groupName ? " is-invalid" : ""}`}
                placeholder="ex. ENL: Spanish"
                onChange={(e) => setGroupName(e.target.value)}
              />
              {errors.groupName && (
                <div className="invalid-feedback d-block">
                  {errors.groupName}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Event Order:</label>
            <div>
              <select
                className={`form-input${errors.eventOrder ? " is-invalid" : ""}`}
                value={eventOrder}
                onChange={(e) => setEventOrder(e.target.value)}
              >
                <option value="" disabled>
                  Select Order
                </option>
                {props.orders.map((order, index) => (
                  <option key={index} value={order}>
                    {order.join(", ")}
                  </option>
                ))}
              </select>
              {errors.eventOrder && (
                <div className="invalid-feedback d-block">
                  {errors.eventOrder}
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Route #:</label>
            <div>
              <input
                type="number"
                className={`form-input${errors.routeNumber ? " is-invalid" : ""}`}
                onChange={(e) => setRouteNumber(e.target.value)}
              />
              {errors.routeNumber && (
                <div className="invalid-feedback d-block">
                  {errors.routeNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="add-button-align">
        <AddButton onClick={handleAddGroup} style={{ fontSize: "30px" }}>
          Add
          <i
            className="bi bi-plus-circle"
            style={{ marginLeft: "30px", fontSize: "30px" }}
          ></i>
        </AddButton>
      </div>
    </main>
  );
}
